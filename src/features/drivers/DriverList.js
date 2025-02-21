import React, { useState } from 'react';
import { Button, Input, Typography, ConfigProvider, Card, Pagination } from 'antd';
import { useNavigate } from 'react-router-dom';
import useTitle from "../../hooks/useTitle";

const DriverList = ({ drivers }) => {
  useTitle('Drivers | Good to Go!');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of items per page

  const handleRowClick = (driverNum) => {
    navigate(`/atlan/drivers/${driverNum}`); // Routing to EditUser component based on driverNum
  };
  
  const handleAddDriverClick = () => {
    navigate('/atlan/drivers/new'); // Routing to AddDriver component
  };

  const filteredDrivers = drivers.filter((driver) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      driver.userId.username.toLowerCase().includes(lowerSearchTerm) ||
      driver.driverNum.toLowerCase().includes(lowerSearchTerm) // Filtering by driverNum
    );
  });

  const sortedDrivers = filteredDrivers.sort((a, b) => a.driverNum.localeCompare(b.driverNum)); // Sort by driverNum

  // Get the current page's drivers
  const paginatedDrivers = sortedDrivers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalDrivers = sortedDrivers.length; // Total number of drivers

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
          Drivers
        </Typography.Title>
        <Input
          placeholder="Search by name or driver number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: 16 }} 
        />
        <div className="vertical-driver-list">
          {paginatedDrivers.map((driver) => (
            <Card
              hoverable
              key={driver.driverNum}
              style={{ marginBottom: 16, color: '#fff', cursor: 'pointer' }}
              onClick={() => handleRowClick(driver.driverNum)} // Routing on click
            >
              <Typography.Title level={5} style={{ color: '#fff' }}>
                {driver.userId.username}
              </Typography.Title>
              <Typography.Paragraph style={{ color: '#fff' }}>
                Driver Number: {driver.driverNum}
              </Typography.Paragraph>
            </Card>
          ))}
        </div>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalDrivers}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false} // Optionally hide the size changer
          style={{ marginTop: '20px', textAlign: 'center', color: '#fff' }} // Center the pagination
        />


        <Button 
          type="primary" 
          onClick={handleAddDriverClick} 
          style={{ marginTop: 16 }} // Optional styling
        >
          Add Driver
        </Button>
      </div>
    </ConfigProvider>
  );
};

export default DriverList;
