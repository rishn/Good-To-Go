import React from 'react';
import { Layout, Menu, ConfigProvider, Avatar, Button, Dropdown, Space } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftOutlined, BarChartOutlined, HomeOutlined, TeamOutlined, LogoutOutlined, UserOutlined, CheckCircleOutlined, CarOutlined, KeyOutlined } from '@ant-design/icons';
import { useSendLogoutMutation } from '../features/auth/authApiSlice';
import useAuth from '../hooks/useAuth';
import { Outlet } from 'react-router-dom';
import Logo from '../img/logo.png'

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
            <Menu.Item key="profile" icon={<UserOutlined />} onClick={()=>{navigate('/atlan/profile')}}>
                Profile
            </Menu.Item>
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
                    <Link to="/atlan">Home</Link>
                </Menu.Item>
                <Menu.Item key="profile" icon={<UserOutlined />}>
                    <Link to="/atlan/profile">Profile</Link>
                </Menu.Item>
                {(isDriver || !isAdmin) && (
                    <Menu.Item key="manage-bookings" icon={<CheckCircleOutlined />}>
                        <Link to="/atlan/bookings">Bookings</Link>
                    </Menu.Item>
                )}
                {isAdmin && (
                    <Menu.Item key="manage-users" icon={<TeamOutlined />}>
                        <Link to="/atlan/drivers">Drivers</Link>
                    </Menu.Item>
                )}
                {isAdmin && (
                    <Menu.Item key="manage-admins" icon={<KeyOutlined />}>
                        <Link to="/atlan/admins">Admins</Link>
                    </Menu.Item>
                )}
                {isAdmin && (
                    <Menu.Item key="manage-vehicles" icon={<CarOutlined />}>
                        <Link to="/atlan/vehicles">Vehicles</Link>
                    </Menu.Item>
                )}
                {isAdmin && (
                    <Menu.Item key="analytics" icon={<BarChartOutlined />}>
                        <Link to="/atlan/analytics">Analytics</Link>
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
                    colorPrimary: "#375f7b", // Setting the primary color for the theme
                    colorBgBase: "#2d2d2d"
                },
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                {/* Header */}
                <Header style={{ backgroundColor: '#264255', padding: '0 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to={pathname.includes('/atlan') ? "/atlan" : pathname} style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                            <img src={Logo} style={{ width: '10%', marginRight: '2px' }}/> Good to Go!
                        </Link>
                        {pathname.includes('/atlan') && <Space>
                            <Button type="text" shape="circle" icon={<ArrowLeftOutlined />}
                                onClick={() => { window.history.back(); }}>
                            </Button>
                            <p style={{ color: '#fff', margin: '0 8px' }}>{status}</p>
                            <p style={{ color: '#fff', margin: '0 8px' }}>{username}</p>
                            <Dropdown overlay={profileMenu}>
                                <Avatar style={{ backgroundColor: '#1890ff' }} icon={username.charAt(0).toUpperCase()} />
                            </Dropdown>
                        </Space>}
                    </div>
                </Header>

                {/* Main Layout */}
                <Layout style={{ flexGrow: 1 }}>
                    {/* Sidebar */}
                    {pathname.includes('/atlan') && <Sider 
                        width={200} 
                        style={{ 
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundColor: '#101c24'
                        }}>
                        {sidebarMenu}
                    </Sider>}

                    {/* Content Area */}
                    <Layout style={{ backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: 'url("/background.png")' }}>
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
                <Footer style={{ textAlign: 'center', backgroundColor: '#264255', color: '#fff', width: '100%', position: 'relative', bottom: 0 }}>
                    Good to Go! by Educify™ 2025
                </Footer>
            </Layout>
        </ConfigProvider>
    );
};

export default DashLayout;
