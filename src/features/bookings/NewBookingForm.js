import { useState, useEffect } from "react";
import { useGetBookingsQuery, useAddNewBookingMutation, useDeleteBookingMutation } from "./bookingsApiSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrashCan, faLocationArrow } from "@fortawesome/free-solid-svg-icons";
import { Input, Button, Typography, Form, message, ConfigProvider, Modal } from "antd";
import useTitle from "../../hooks/useTitle";
import useAuth from '../../hooks/useAuth';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { geocode } from 'opencage-api-client';

const NewBookingForm = ({ drivers }) => {
    useTitle('Add Booking | Atlan Application');
    const { id, username } = useAuth();
    const [createNewBooking, { isSuccess: isBookingSuccess, isError: isBookingError, error: bookingError }] = useAddNewBookingMutation();
    const [deleteBooking, { isSuccess: isDelBookingSuccess, isError: isDelBookingError, error: delBookingError }] = useDeleteBookingMutation();
    const {
        data: bookingsResult,
      } = useGetBookingsQuery('bookingsList', {
        pollingInterval: 15000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
      });

    const navigate = useNavigate();

    const [form] = Form.useForm();
    const [pickupAddress, setPickupAddress] = useState('');
    const [pickupLocation, setPickupLocation] = useState({ lat: 0, lng: 0 });
    const [dropoffAddress, setDropoffAddress] = useState('');
    const [dropoffLocation, setDropoffLocation] = useState({ lat: 0, lng: 0 });
    const [price, setPrice] = useState('');
    const [distance, setDistance] = useState('');
    const [weight, setWeight] = useState('');
    const [driverId, setDriverId] = useState('');
    const [item, setItem] = useState('');
    const [showMap, setMap] = useState('');
    const [bookingId, setBookingId] = useState('')
    const [newBookings, setNewBookings] = useState([])
    let map = null;
    let routePolyline = null; // Store reference to the route polyline

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

    useEffect(() => {
        form.setFieldValue({ pickupAddress: pickupAddress })
        form.setFieldValue({ dropoffAddress: dropoffAddress })
    }, [pickupAddress, dropoffAddress]);

    useEffect(() => {
        if (isDelBookingSuccess) {
            message.info("Booking has been cancelled");
        }
        else if (isDelBookingError && delBookingError) {
            if ('data' in delBookingError && delBookingError.data && typeof delBookingError.data === 'object' && 'message' in delBookingError.data)
                message.error(delBookingError.data.message);
            else if ('message' in delBookingError)
                message.error(delBookingError.message);
            else
                message.error("An unknown error occurred");
        }
    }, [ isDelBookingSuccess, isDelBookingError, delBookingError ])

    useEffect(() => {
        if (isBookingError && bookingError) {
            if ('data' in bookingError && bookingError.data && typeof bookingError.data === 'object' && 'message' in bookingError.data)
                message.error(bookingError.data.message);
            else if ('message' in bookingError)
                message.error(bookingError.message);
            else
                message.error("An unknown error occurred");
        }
    }, [ isBookingSuccess, isBookingError, bookingError ])

    useEffect(() => {
        const bookings = bookingsResult?.ids ? bookingsResult.ids.map((id) => bookingsResult.entities[id]) : [];

        setNewBookings(bookings.filter((booking) => (booking.userId.username === username) && (booking.pickupAddress === pickupAddress) && 
            (booking.dropoffAddress === dropoffAddress) && (booking.status === "pending") && (booking.item === item)));
    }, [bookingsResult]);

    useEffect(() => {
        const currentBooking = newBookings.find(booking => booking.accepted === true);
        if (currentBooking && currentBooking.accepted && currentBooking.driverId) {
            // Trigger Modal
            showConfirmationModal(currentBooking);
        }
    }, [newBookings]);

    // Helper to set the user's current location for pickup or dropoff
    const setCurrentLocation = (setLocationFn) => {
        // Check for permission status
        navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
            if (permissionStatus.state === 'granted') {
                // Location access is already granted
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocationFn({ lat: latitude, lng: longitude });
                        message.success("Location set to your current location");
                    },
                    () => {
                        message.error("Unable to retrieve your location");
                    }
                );
            } else if (permissionStatus.state === 'prompt') {
                // Location access not yet granted, ask for permission
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocationFn({ lat: latitude, lng: longitude });
                        message.success("Location set to your current location");
                    },
                    () => {
                        message.error("Unable to retrieve your location");
                    }
                );
            } else if (permissionStatus.state === 'denied') {
                // Location access has been denied, prompt user to enable it manually
                console.warn("Location access is blocked. Please enable it in your browser settings.");
                Modal.info({
                    title: 'Location Access Required',
                    content: 'Please enable location access in your browser settings to use this feature.',
                    okText: 'Understood',
                    onOk() {
                        console.log('User acknowledged the message.');
                    }
                });
            }
            
            // Listen for changes in permission state
            permissionStatus.onchange = () => {
                console.log(`Permission state changed to ${permissionStatus.state}`);
            };
        });
    };    

    useEffect(() => {
        if (!map) {
            map = L.map('map').setView([20, 80], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            setMap(map);
        }
    }, []);

    const handleMapButton = (() => {
        const fetchLocations = async () => {
            if (pickupAddress) {
                await handleGeocode(pickupAddress, setPickupLocation);
            }
            if (dropoffAddress) {
                await handleGeocode(dropoffAddress, setDropoffLocation);
            }
        };

        fetchLocations();
    });

    useEffect(() => {
        if (pickupLocation.lat !== 0 && dropoffLocation.lat !== 0) {
            const dist = calculateDistance(pickupLocation, dropoffLocation);
            setDistance(dist);

            // Clear existing markers and route polyline
            showMap.eachLayer((layer) => {
                if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                    showMap.removeLayer(layer);
                }
            });

            // Clear the previous route polyline before drawing the new route
            if (routePolyline) {
                showMap.removeLayer(routePolyline);
            }

            const pickupMarker = L.marker([pickupLocation.lat, pickupLocation.lng], { icon: customMarkerIcon }).addTo(showMap);
            const dropoffMarker = L.marker([dropoffLocation.lat, dropoffLocation.lng], { icon: customMarkerIcon }).addTo(showMap);

            drawCoordinates(pickupLocation, dropoffLocation);
        }
    }, [pickupLocation, dropoffLocation]);

    async function handleSubmitBooking(newBookings, booking) {
        if (!newBookings || !booking) {
            console.error('Bookings are required but not provided!');
            return; // Early return if no bookingId
        }
        for (const newBooking of newBookings)
            if (newBooking.id !== booking.id)
                await deleteBooking({ id: newBooking.id });

        message.success('Booking Confirmed!');
        navigate('/atlan/bookings'); // Redirect to bookings list
    };

    async function handleCancelBooking(newBookings) {
        if (!newBookings) {
            console.error('Bookings are required but not provided!');
            return; // Early return if no bookingId
        }
        for (const booking of newBookings)
            await deleteBooking({ id: booking.id });
        message.info('Booking cancelled');
        navigate('/atlan/bookings');
    };

    const handleGeocode = async (address, setLocation) => {
        try {
            const response = await geocode({ q: address, key: process.env.REACT_APP_OPENCAGE_API_KEY });
            if (response.results && response.results.length > 0) {
                const { lat, lng } = response.results[0].geometry;
                setLocation({ lat, lng });
                message.success("Location found");
            }
        } catch (error) {
            message.error("Failed to fetch location coordinates");
        }
    };

    const showConfirmationModal = (booking) => {
        Modal.confirm({
            title: 'Driver Found!',
            content: `Driver ${booking.driverName} ${booking.driverId.rating}★ with vehicle ${booking.vehiclePlate} has accepted the booking.`,
            okText: 'Confirm Booking',
            cancelText: 'Cancel Booking',
            onOk: async () => {
                await handleSubmitBooking(newBookings, booking);
            },
            onCancel: async () => {
                await handleCancelBooking(newBookings); // Pass the correct booking ID
            },
        });
    };

    async function getDirections(location1, location2) {
        const apiKey = process.env.REACT_APP_OPENROUTESERVICE_API_KEY; 
        try {
            const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${location1.lng},${location1.lat}&end=${location2.lng},${location2.lat}`);
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                const route = data.features[0].geometry.coordinates;
                return route;
            } else {
                console.error('No routes found in the API response:', data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching directions data:', error);
            return [];
        }
    }

    const drawCoordinates = async (location1, location2) => {
        const routeCoordinates = await getDirections(location1, location2);
        if (routeCoordinates.length > 0) {
            const routeLatLngs = routeCoordinates.map(coord => [coord[1], coord[0]]);
            
            // Draw the new route and store reference
            routePolyline = L.polyline(routeLatLngs, { color: 'blue' }).addTo(showMap);
            showMap.fitBounds(routeLatLngs);
        } else {
            console.error('No route coordinates available.');
        }
    };

    const calculateDistance = (loc1, loc2) => {
        const R = 6371;
        const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
        const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(R * c);
    };

    useEffect(() => {
        if (distance && weight) {
            const calculatedPrice = calculatePrice(distance, weight);
            setPrice(calculatedPrice.toFixed(2));
        }
    }, [distance, weight]);

    const calculatePrice = (distance, weight) => {
        if (distance < 5) return weight * 10;
        if (distance < 20) return weight * 20;
        return weight * 30;
    };

    const onFinish = async (values) => {
        if (pickupLocation.lat !== 0 && dropoffLocation.lat !== 0 && price !== '' && distance !== '') {
            // Filter drivers within 15 km
            const nearbyDrivers = drivers.filter(driver => {
                const driverLocation = { lat: driver.currentLocation.lat, lng: driver.currentLocation.lng };
                const distToDriver = calculateDistance(pickupLocation, driverLocation);
                return distToDriver <= 15; // Consider drivers within 15 km
            });
    
            // Display nearest drivers on the map
            nearbyDrivers.forEach(driver => {
                L.marker([driver.currentLocation.lat, driver.currentLocation.lng], { icon: carMarkerIcon })
                    .bindPopup(`${driver.userId.username} - ${driver.vehicle.licensePlate} (${driver.vehicle.type})`)
                    .addTo(showMap);
            });

            if (!nearbyDrivers.length)
                message.info("No nearby drivers near your location right now... Please try again later");
    
            // Create booking for each nearby driver
            for (const driver of nearbyDrivers) {
                const bookingPayload = {
                    userId: id,
                    driverId: driver.id, // Use the actual driver's ID
                    item: values.item,
                    weight: parseFloat(values.weight),
                    pickupAddress,
                    pickupLocation,
                    dropoffAddress,
                    dropoffLocation,
                    distance,
                    price: parseFloat(values.price || price),
                    accepted: false
                };
    
                try {
                    await createNewBooking(bookingPayload).unwrap(); // Send booking request
                    message.success(`Booking created for driver ${driver.userId.username}!`);
                } catch (error) {
                    message.error(`Failed to create booking for driver ${driver.userId.username}.`);
                    console.error(error);
                }
            }
        } else {
            message.error("Please fill all required fields and ensure valid locations.");
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorBgBase: "#333",
                    colorText: "#fff",
                    colorTextBase: "#eee",
                    modalColorBg: "#222",
                },
                components: {
                    Modal: {
                        colorBgContainer: "#222",
                        colorText: "#fff"
                    }
                }
            }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 600, margin: 'auto' }}
            >
                <Typography.Title level={2}>New Booking</Typography.Title>

                <Form.Item
                    label="Pickup Address"
                    name="pickupAddress"
                >
                    <Input
                        placeholder="Enter Pickup Address"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)} 
                        rules={[{ required: true, message: 'Pickup address is required!' }]}
                    />
                    {(pickupAddress === '' || pickupAddress === 'Your Current Location') && <Button onClick={() => {
                        setCurrentLocation(setPickupLocation);
                        setPickupAddress('Your Current Location');
                    }} style={{ marginTop: '10px' }}>
                        <FontAwesomeIcon icon={faLocationArrow} /> Use Current Location
                    </Button>}
                </Form.Item>

                <Form.Item
                    label="Dropoff Address"
                    name="dropoffAddress"
                >
                    <Input
                        placeholder="Enter Dropoff Address"
                        value={dropoffAddress}
                        onChange={(e) => setDropoffAddress(e.target.value)} 
                        rules={[{ required: true, message: 'Dropoff address is required!' }]}
                    />
                    {(dropoffAddress === '' || dropoffAddress === 'Your Current Location') && <Button onClick={() => {
                        setCurrentLocation(setDropoffLocation);
                        setDropoffAddress('Your Current Location');
                    }} style={{ marginTop: '10px' }}>
                        <FontAwesomeIcon icon={faLocationArrow} /> Use Current Location
                    </Button>}
                </Form.Item>

                <Button type="primary" onClick={handleMapButton}>
                    <FontAwesomeIcon icon={faSave} /> Show on Map
                </Button>

                <div id="map" style={{ height: '400px', marginTop: '20px', marginBottom: '20px' }}></div>

                <Form.Item
                    label="Weight (kg)"
                    name="weight"
                    rules={[{ required: true, message: 'Weight is required!' }]}
                >
                    <Input
                        placeholder="Enter Weight"
                        type="number"
                        min={1}
                        onChange={(e) => setWeight(e.target.value)} 
                    />
                </Form.Item>

                <Form.Item label="Estimated Distance (km)"> 
                    <Input value={distance} readOnly /> 
                </Form.Item>

                <Form.Item label="Estimated Price ($)">
                    <Input value={price} readOnly />
                </Form.Item>

                <Form.Item
                    label="Item Description"
                    name="item"
                    rules={[{ required: true, message: 'Item description is required!' }]}
                >
                    <Input placeholder="Enter item description" onChange={(e) => setItem(e.target.value)} />
                </Form.Item>

                <Button type="primary" htmlType="submit" style={{ marginRight: 5 }}>
                    <FontAwesomeIcon icon={faSave} /> Find Driver
                </Button>

                {newBookings.length > 0 && <Button danger onClick={()=>{handleCancelBooking(newBookings)}}>
                    <FontAwesomeIcon icon={faTrashCan} /> Cancel
                </Button>}
            </Form>
        </ConfigProvider>
    );
};

export default NewBookingForm;
