import React, { useState } from 'react';
import { Button, Input, Typography, ConfigProvider, Card, Pagination } from 'antd';
import { useNavigate } from 'react-router-dom';
import useTitle from "../../hooks/useTitle";
import useAuth from '../../hooks/useAuth';

const BookingList = ({ bookings }) => {
  useTitle('Bookings | Good to Go!');

  const { isDriver } = useAuth();

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of items per page

  const handleRowClick = (bookingId) => {
    navigate(`/atlan/bookings/${bookingId}`); // Routing to EditBooking component based on bookingId
  };

  const handleAddBookingClick = () => {
    navigate('/atlan/bookings/new'); // Routing to AddBooking component
  };

  const filteredBookings = bookings.filter((booking) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      booking.item.toLowerCase().includes(lowerSearchTerm) || 
      `${booking.pickupLocation.lat}, ${booking.pickupLocation.lng}`.includes(lowerSearchTerm) ||
      `${booking.dropoffLocation.lat}, ${booking.dropoffLocation.lng}`.includes(lowerSearchTerm)
    );
  });

  const sortedBookings = filteredBookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // Sort by creation date (descending)

  // Get the current page's bookings
  const paginatedBookings = sortedBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalBookings = sortedBookings.length; // Total number of bookings

  return (
    <ConfigProvider theme={{
      components: {
        Input: {
          colorBgContainer: '#2d2d2d', 
          colorText: "#fff", // White text
        },
        Card: {
          colorBgContainer: 'rgba(100, 100, 100, 0.4)',
          colorText: '#fff',
          colorTextHeading: '#fff', 
          colorBorder: 'transparent'
        }
      },
      token: {
        colorTextPlaceholder: "#aaa"
      }
    }}>
      <div style={{ padding: '20px 40px' }}>
        <Typography.Title style={{ color: '#fff' }} level={3}>
          My Bookings
        </Typography.Title>
        <Input
          placeholder="Search by item, pickup location, or dropoff location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: 16 }} 
        />
        <div className="vertical-booking-list">
          {paginatedBookings.map((booking) => (
            <Card
              hoverable
              key={booking._id}
              style={{ marginBottom: 16, color: '#fff', cursor: 'pointer' }}
              onClick={() => handleRowClick(booking._id || booking.id)} // Routing on click
            >
              <Typography.Title level={5} style={{ color: '#fff' }}>
                {booking.item}
              </Typography.Title>
              <Typography.Paragraph style={{ color: '#fff' }}>
                {booking.pickupAddress === 'Your Current Location' 
                ? `Lat ${booking.pickupLocation.lat}, Lng ${booking.pickupLocation.lng}`
                : booking.pickupAddress} to {booking.dropoffAddress === 'Your Current Location' 
                ? `Lat ${booking.dropoffLocation.lat}, Lng ${booking.dropoffLocation.lng}`
                : booking.dropoffAddress}
              </Typography.Paragraph>
              <Typography.Paragraph style={{ color: '#fff' }}>
                Status: {booking.status}
              </Typography.Paragraph>
              <Typography.Paragraph style={{ color: '#fff' }}>
                {isDriver ? `Customer: ${booking.userId.username}` : `Driver: ${booking.driverName} ${booking.driverId.rating}★`}
              </Typography.Paragraph>
            </Card>
          ))}
        </div>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalBookings}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false} // Optionally hide the size changer
          style={{ marginTop: '20px', textAlign: 'center', color: '#fff' }} // Center the pagination
        />

        {!isDriver && <Button
          type="primary"
          onClick={handleAddBookingClick}
          style={{ marginTop: 16 }} // Optional styling
        >
          Add Booking
        </Button>}
      </div>
    </ConfigProvider>
  );
};

export default BookingList;
