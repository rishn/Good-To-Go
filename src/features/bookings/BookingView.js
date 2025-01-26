import React, { useEffect, useState } from 'react';
import { Typography, Card, ConfigProvider, Button, message, Input } from 'antd';
import useAuth from '../../hooks/useAuth';
import useTitle from '../../hooks/useTitle';
import { useUpdateBookingMutation, useDeleteBookingMutation } from './bookingsApiSlice';
import { useUpdateDriverMutation } from '../drivers/driversApiSlice';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { geocode } from 'opencage-api-client';
import { useNavigate } from 'react-router-dom';

const BookingView = ({ booking }) => {
  useTitle(`${booking.userId.username}'s ${booking.item} Transport | Good to Go!`);
  const { isDriver } = useAuth();

  const navigate = useNavigate(); 

  // State for driver location update
  const [driverLocation, setDriverLocation] = useState({ lat: booking.driverLocation.lat, lng: booking.driverLocation.lng });
  const [locationInput, setLocationInput] = useState('');
  const [accepted, setAccepted] = useState(booking.accepted);

  const [updateBooking, { isSuccess: isBookingSuccess, isError: isBookingError, error: bookingError }] = useUpdateBookingMutation();
  const [deleteBooking, { isSuccess: isDelBookingSuccess, isError: isDelBookingError, error: delBookingError }] = useDeleteBookingMutation();
  const [updateDriver, { isSuccess: isDriverSuccess, isError: isDriverError, error: driverError }] = useUpdateDriverMutation();

  useEffect(() => {
    const map = L.map('map').setView([20, 80], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom marker icon
    const customMarkerIcon = new L.Icon({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const carMarkerIcon = new L.Icon({
      iconUrl: '/car_marker.png', // Update with car icon URL
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

    // Markers for pickup and dropoff locations
    const pickupMarker = L.marker([booking.pickupLocation.lat, booking.pickupLocation.lng], { icon: customMarkerIcon }).addTo(map).bindPopup('Pickup Location');
    const dropoffMarker = L.marker([booking.dropoffLocation.lat, booking.dropoffLocation.lng], { icon: customMarkerIcon }).addTo(map).bindPopup('Dropoff Location');
    
    // Driver location marker
    const driverMarker = L.marker([driverLocation.lat, driverLocation.lng], { icon: carMarkerIcon }).addTo(map).bindPopup(`Driver Location: ${booking.driverId.driverNum}`);

    // Draw route from pickup to dropoff
    const drawRoute = async (start, end) => {
      const apiKey = process.env.REACT_APP_OPENROUTESERVICE_API_KEY;
      try {
        const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const route = data.features[0].geometry.coordinates;
          const latLngs = route.map(coord => [coord[1], coord[0]]);
          L.polyline(latLngs, { color: 'blue' }).addTo(map);
        } else {
          console.error('No routes found in the API response:', data);
        }
      } catch (error) {
        console.error('Error fetching directions:', error);
      }
    };

    drawRoute(booking.pickupLocation, booking.dropoffLocation);

    return () => {
      // Cleanup map instance
      map.remove();
    };
  }, [booking, driverLocation]);

  useEffect(() => {
    if (isDriverSuccess)
      message.success('Driver location updated!');

    if (isDriverError && driverError) {
        if ('data' in driverError && driverError.data && typeof driverError.data === 'object' && 'message' in driverError.data)
            message.error(driverError.data.message);
        else if ('message' in driverError)
            message.error(driverError.message);
        else
            message.error("An unknown error occurred");
    }
  }, [ isDriverSuccess, isDriverError, driverError ]);

  useEffect(() => {
    if (isDelBookingError && delBookingError) {
        if ('data' in delBookingError && delBookingError.data && typeof delBookingError.data === 'object' && 'message' in delBookingError.data)
            message.error(delBookingError.data.message);
        else if ('message' in delBookingError)
            message.error(delBookingError.message);
        else
            message.error("An unknown error occurred");
    }
  }, [ isDelBookingSuccess, isDelBookingError, delBookingError ]);

  useEffect(() => {
    if (isBookingSuccess) {
        message.success("Booking status updated");
    }
      if (isBookingError && bookingError) {
          if ('data' in bookingError && bookingError.data && typeof bookingError.data === 'object' && 'message' in bookingError.data)
              message.error(bookingError.data.message);
          else if ('message' in bookingError)
              message.error(bookingError.message);
          else
              message.error("An unknown error occurred");
      }
  }, [ isBookingSuccess, isBookingError, bookingError ]);

  const handleAcceptBooking = async () => {
    try {
      setAccepted(true);
      await updateBooking({ id: booking._id || booking.id, accepted: true, status: 'pending' });

      message.success('Booking accepted!');
      navigate('/atlan/bookings');
    } catch (error) {
      message.error('Error accepting booking.');
    }
  };

  const handleCancelBooking = async () => {
    try {
      setAccepted(false);
      await deleteBooking({ id: booking._id || booking.id });

      message.info('Booking canceled');
      navigate('/atlan/bookings');
    } catch (error) {
      message.error('Error canceling booking.');
    }
  };

  const handleLocationUpdate = async () => {
    if (locationInput) {
      try {
        const response = await geocode({ q: locationInput, key: process.env.REACT_APP_OPENCAGE_API_KEY });
        if (response.results && response.results.length > 0) {
            const { lat, lng } = response.results[0].geometry;
            setDriverLocation({ lat, lng });
            await updateDriver({ id: booking.driverId.id || booking.driverId._id, driverNum: booking.driverId.driverNum, currentLocation: { lat, lng } });
          } else {
            message.error('Location not found. Please try again.');
          }
      } 
      catch (error) {
          message.error("Failed to fetch location coordinates");
      }
    }
  };

  const handleCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setDriverLocation({ lat: latitude, lng: longitude });
        await updateDriver({ id: booking.driverId.id || booking.driverId._id, driverNum: booking.driverId.driverNum, currentLocation: { lat: latitude, lng: longitude } });
      }, (error) => {
        message.error('Location access denied. Please allow location access to use this feature.');
      });
    } else {
      message.error('Geolocation is not supported by this browser.');
    }
  };

  const handleCompleteBooking = async () => {
    try {
      await updateBooking({ id: booking._id || booking.id, status: 'completed', accepted: booking.accepted });
      await updateDriver({ id: booking.driverId.id || booking.driverId._id, driverNum: booking.driverId.driverNum, trips: booking.driverId.trips + 1 });
      message.success('Booking marked as completed!');
    } catch (error) {
      message.error('Error marking booking as completed.');
    }
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            colorBgContainer: 'rgba(100, 100, 100, 0.4)',
            colorText: '#fff',
            colorTextHeading: '#fff', 
            colorBorder: 'transparent'
          },
        },
        token: {
          colorTextPlaceholder: "#aaa"
        }
      }}
    >
      <div style={{ padding: '20px 40px' }}>
        <Typography.Title style={{ color: '#fff' }} level={3}>
          Booking Details
        </Typography.Title>
        <Card style={{ marginBottom: 16, color: '#fff' }}>
          <Typography.Title level={5} style={{ color: '#fff' }}>
            Item: {booking.item}
          </Typography.Title>
          <Typography.Paragraph style={{ color: '#fff' }}>
            Pickup Location: {booking.pickupAddress === 'Your Current Location' 
              ? `Lat ${booking.pickupLocation.lat}, Lng ${booking.pickupLocation.lng}`
              : booking.pickupAddress}
          </Typography.Paragraph>
          <Typography.Paragraph style={{ color: '#fff' }}>
            Dropoff Location: {booking.dropoffAddress === 'Your Current Location' 
              ? `Lat ${booking.dropoffLocation.lat}, Lng ${booking.dropoffLocation.lng}`
              : booking.dropoffAddress}
          </Typography.Paragraph>
          <Typography.Paragraph style={{ color: '#fff' }}>
            Price: ${booking.price}
          </Typography.Paragraph>
          <Typography.Paragraph style={{ color: '#fff' }}>
            Status: {booking.status}
          </Typography.Paragraph>
          <Typography.Paragraph style={{ color: '#fff' }}>
            {isDriver ? `Customer: ${booking.userId.username}` : `Driver: ${booking.driverName} ${booking.vehiclePlate} ${booking.driverId.rating}★`}
          </Typography.Paragraph>
          
          {!isDriver && booking.status === 'pending' && <Button onClick={handleCancelBooking} type="primary" danger>
              Cancel Booking
          </Button>}

          {isDriver && (<>
            <div style={{ marginTop: 16 }}>
              {booking.status === 'pending' && !accepted && <Button onClick={handleAcceptBooking} type="primary" style={{ marginRight: 8 }}>
                Accept Booking
              </Button>}
            </div>
          
            <div style={{ marginTop: '20px' }}>
              <Input 
                placeholder="Enter location" 
                value={locationInput} 
                onChange={(e) => setLocationInput(e.target.value)} 
                style={{ marginBottom: '10px' }} 
              />
              <Button onClick={handleLocationUpdate} type="primary" style={{ marginRight: '8px' }}>
                Update Location
              </Button>
              <Button onClick={handleCurrentLocation} type="primary">
                Use Current Location
              </Button>
            </div>
          </>)}
          <div>
            {isDriver && booking.status === 'pending' && accepted && <Button onClick={handleCompleteBooking} type="primary" style={{ marginTop: 8 }}>
              Mark as Completed
            </Button>}
          </div>
        </Card>
        <div id="map" style={{ height: '400px' }}></div>
      </div>
    </ConfigProvider>
  );
};

export default BookingView;
