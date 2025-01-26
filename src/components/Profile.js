import React, { useEffect, useState } from 'react';
import { Avatar, Button, Card, Typography, ConfigProvider, Spin, Modal, Form, Input, Space, Divider, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation } from '../features/users/usersApiSlice';
import { useGetDriversQuery } from '../features/drivers/driversApiSlice';
import useAuth from '../hooks/useAuth';
import useTitle from '../hooks/useTitle';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrashCan } from "@fortawesome/free-solid-svg-icons";

const Profile = () => {
  const { id, username, isDriver, isAdmin } = useAuth();

  useTitle(`${username} | Good to Go!`);

  const navigate = useNavigate();

  const [updateUser] = useUpdateUserMutation();
  const [deleteUser, { isSuccess: isDelUserSuccess }] = useDeleteUserMutation();
  const { data: usersResult, isSuccess: isUsersSuccess, isLoading: isUsersLoading } = useGetUsersQuery(undefined);
  const { data: driversResult, isSuccess: isDriversSuccess, isLoading: isDriversLoading } = useGetDriversQuery(undefined);

  const [userData, setUserData] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [pwd, setPwd] = useState('');
  const [cPwd, setCPwd] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [form] = Form.useForm();

  
  useEffect(() => {
    if (isDelUserSuccess) {
        message.success("User deleted");
        navigate('/'); 
    }
  }, [isDelUserSuccess, navigate]);  

  useEffect(() => {
    if (isUsersSuccess && usersResult) {
      const users = usersResult?.ids ? usersResult.ids.map((id) => usersResult.entities[id]) : [];
      const currentUser = users.find(user => user.id === id);
      setUserData(currentUser);

      if (isDriver && isDriversSuccess && driversResult) {
        const driverInfo = driversResult.ids
          .map(id => driversResult.entities[id])
          .find(driver => driver.userId._id === currentUser.id);
        setDriverData(driverInfo);
      }
    }
  }, [usersResult, isUsersSuccess, driversResult, isDriversSuccess]);

  const handlePasswordSubmit = async () => {
    if (pwd !== cPwd) {
      message.error("New password and confirm password do not match.");
      return;
    }

    try {
      await updateUser({ ...userData, id: id, password: pwd }).unwrap();
      message.success("Password updated successfully");
      setIsPasswordModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err.data?.message);
    }
  };

  const onDeleteUserClicked = async () => {
    await deleteUser({ id: id })
    navigate('/');
  };

  if (isUsersLoading || isDriversLoading) {
    return <Spin tip="Loading profile..." />;
  }

  return (
    <ConfigProvider theme={{ token: { colorText: '#fff', colorTextDescription: '#eee', colorBgBase: "#888", colorTextPlaceholder: "#444" }, 
        components: { Card: { colorBgContainer: 'rgba(100, 100, 100, 0.4)', colorBorder: 'transparent' } } 
    }}>
      <div style={{ padding: '20px 40px' }}>
        <Typography.Title style={{ color: '#fff' }} level={3}>
          Profile
        </Typography.Title>
        {userData && (
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Typography.Title level={4} style={{ color: '#fff', marginTop: 10 }}>
                {userData.username}
              </Typography.Title>
            </div>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Typography.Text strong>Email:</Typography.Text> {userData.email}
              </Col>
              <Col span={8}>
                <Typography.Text strong>Contact Number:</Typography.Text> {userData.contactNumber}
              </Col>
              <Col span={8}>
                <Typography.Text strong>Role:</Typography.Text> {userData.role}
              </Col>
            </Row>

            {isDriver && driverData && (
              <>
                <Divider />
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Typography.Text strong>Driver Number:</Typography.Text> {driverData.driverNum}
                  </Col>
                  <Col span={8}>
                    <Typography.Text strong>Vehicle Type:</Typography.Text> {driverData.vehicle.type}
                  </Col>
                  <Col span={8}>
                    <Typography.Text strong>License Plate:</Typography.Text> {driverData.vehicle.licensePlate}
                  </Col>
                </Row>
                <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
                  <Col span={8}>
                    <Typography.Text strong>Current Location:</Typography.Text> 
                    Lat: {driverData.currentLocation.lat}, Lng: {driverData.currentLocation.lng}
                  </Col>
                  <Col span={8}>
                    <Typography.Text strong>Availability:</Typography.Text> {driverData.availability ? 'Available' : 'Unavailable'}
                  </Col>
                  <Col span={8}>
                    <Typography.Text strong>Trips Completed:</Typography.Text> {driverData.trips}
                  </Col>
                </Row>
                <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
                  <Col span={8}>
                    <Typography.Text strong>Driver Rating:</Typography.Text> {driverData.rating}
                  </Col>
                </Row>
              </>
            )}

            <Divider orientation="left" />
            <Button type="primary" onClick={() => setIsPasswordModalOpen(true)}>
              Change Password
            </Button>
          </Card>
        )}
      </div>

      {/* Password Change Modal */}
      <Modal
        title="Change Password"
        open={isPasswordModalOpen}
        onCancel={() => setIsPasswordModalOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={handlePasswordSubmit}>
          <Form.Item
            name="newPassword"
            label="New Password"
            onChange={(e) => setPwd(e.target.value)} // Corrected here
            rules={[{ required: true, message: 'Please input your new password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            onChange={(e) => setCPwd(e.target.value)} // Corrected here
            rules={[{ required: true, message: 'Please confirm your new password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Change Password</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Divider />
      {!isDriver && !isAdmin && <Button danger onClick={onDeleteUserClicked} icon={<FontAwesomeIcon icon={faTrashCan} />}>
        Remove Account
      </Button>}
    </ConfigProvider>
  );
};

export default Profile;
