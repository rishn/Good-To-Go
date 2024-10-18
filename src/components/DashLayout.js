import React from 'react';
import { Layout, Menu, ConfigProvider, Avatar, Button, Dropdown, Space } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, TeamOutlined, LogoutOutlined, CheckCircleOutlined, CarOutlined, KeyOutlined } from '@ant-design/icons';
import { useSendLogoutMutation } from '../features/auth/authApiSlice';
import useAuth from '../hooks/useAuth';
import { Outlet } from 'react-router-dom';

const { Header, Sider, Content, Footer } = Layout;

const DashLayout = () => {
    const { isAdmin, isDriver, username, status } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [sendLogout, { isLoading, isSuccess, isError, error }] = useSendLogoutMutation();

    // Handle logout
    const onLogoutClicked = () => {
        sendLogout();
        navigate('/');
    };

    const profileMenu = (
        <Menu>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogoutClicked}>
                Logout
            </Menu.Item>
        </Menu>
    );

    // Sidebar Menu items
    const sidebarMenu = (
        <ConfigProvider
            theme={{
            components: {
                Menu: {
                    itemSelectedBg: "#ddd",
                    itemHoverBg: "#555"
                },
            },
            }}
        >
            <Menu
                mode="inline"
                style={{ height: '100%', borderRight: 0, backgroundColor: "transparent", color: "#fff" }} // Make the background transparent
            >
                <Menu.Item key="home" icon={<HomeOutlined />}>
                    <Link to="/dash">Home</Link>
                </Menu.Item>
                {(isDriver || !isAdmin) && (
                    <Menu.Item key="manage-bookings" icon={<CheckCircleOutlined />}>
                        <Link to="/dash/bookings">Bookings</Link>
                    </Menu.Item>

                )}
                {isAdmin && (
                    <Menu.Item key="manage-users" icon={<TeamOutlined />}>
                        <Link to="/dash/drivers">Drivers</Link>
                    </Menu.Item>
                )}
                {isAdmin && (
                    <Menu.Item key="manage-admins" icon={<KeyOutlined />}>
                        <Link to="/dash/admins">Admins</Link>
                    </Menu.Item>
                )}
                {isAdmin && (
                    <Menu.Item key="manage-vehicles" icon={<CarOutlined />}>
                        <Link to="/dash/vehicles">Vehicles</Link>
                    </Menu.Item>
                )}
            </Menu>
        </ConfigProvider>
    );

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorText: "#fff",
                    colorPrimary: "#0f172a", // Setting the primary color for the theme
                    colorBgBase: "#000"
                },
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                {/* Header */}
                <Header style={{ backgroundColor: '#0f172a', padding: '0 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to="/dash" style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                            Atlan Application
                        </Link>
                        <Space>
                            <p style={{ color: '#fff', margin: '0 8px' }}>{username}</p>
                            <p style={{ color: '#fff', margin: '0 8px' }}>{status}</p>
                            <Dropdown overlay={profileMenu}>
                                <Avatar style={{ backgroundColor: '#1890ff' }} icon={username.charAt(0).toUpperCase()} />
                            </Dropdown>
                        </Space>
                    </div>
                </Header>

                {/* Main Layout */}
                <Layout style={{ flexGrow: 1 }}>
                    {/* Sidebar */}
                    <Sider 
                        width={200} 
                        style={{ 
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}>
                        {sidebarMenu}
                    </Sider>

                    {/* Content Area */}
                    <Layout style={{ padding: '0 24px 24px', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: 'url("/background.jpeg")' }}>
                        <Content
                            style={{
                                padding: 24,
                                margin: 0,
                                minHeight: '100%',  // Ensures content area is as tall as possible
                                backgroundColor: 'rgba(0, 0, 0, 0.4)', // Translucent black background
                                borderRadius: '8px', // Optional: adds rounded corners to the content area
                            }}
                        >
                            <Outlet />
                        </Content>
                    </Layout>
                </Layout>

                {/* Footer */}
                <Footer style={{ textAlign: 'center', backgroundColor: '#0f172a', color: '#fff', width: '100%', position: 'relative', bottom: 0 }}>
                    Atlan Application 2024
                </Footer>
            </Layout>
        </ConfigProvider>
    );
};

export default DashLayout;
