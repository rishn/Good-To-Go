import React, { useEffect, useState } from 'react';
import { Typography, Card, ConfigProvider, Row, Col, Spin } from 'antd';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useGetDriversQuery } from '../drivers/driversApiSlice';

const AdminDashboard = () => {
  const { data: driversResult, isSuccess: isDriversSuccess, isLoading: isDriversLoading } = useGetDriversQuery(undefined);
  const drivers = driversResult?.ids ? driversResult.ids.map((id) => driversResult.entities[id]) : [];
  const [driverData, setDriverData] = useState([]);

  // Set colors for pie chart slices
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28F6E'];

  useEffect(() => {
    if (isDriversSuccess && drivers.length) {
      const formattedData = drivers.map(driver => ({
        name: driver.userId.username,  // Access the username for display
        completedBookings: driver.trips || 0,
      }));
      setDriverData(formattedData);
    }
  }, [drivers, isDriversSuccess]);

  if (isDriversLoading) {
    return <Spin tip="Loading drivers..." />;
  }

  return (
    <ConfigProvider theme={{ components: { Card: { colorBgContainer: '#1f1f1f', colorText: '#fff' } } }}>
      <div style={{ padding: '20px 40px' }}>
        <Typography.Title style={{ color: '#fff' }} level={3}>
          Admin Analytics Dashboard
        </Typography.Title>
        
        <Row gutter={16}>
          <Col span={12}>
            <Card style={{ backgroundColor: '#1f1f1f', color: '#fff', textAlign: 'center' }}>
              <Typography.Title level={4} style={{ color: '#fff' }}>
                Drivers' Completed Bookings (Pie Chart)
              </Typography.Title>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={driverData}
                    dataKey="completedBookings"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    label
                  >
                    {driverData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col span={12}>
            <Card style={{ backgroundColor: '#1f1f1f', color: '#fff', textAlign: 'center' }}>
              <Typography.Title level={4} style={{ color: '#fff' }}>
                Drivers' Completed Bookings (Bar Chart)
              </Typography.Title>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={driverData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#fff' }} />
                  <YAxis tick={{ fill: '#fff' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completedBookings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default AdminDashboard;
