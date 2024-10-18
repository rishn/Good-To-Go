import { Link } from 'react-router-dom';
import { Typography, Button, Space, ConfigProvider } from 'antd';
import useAuth from '../../hooks/useAuth';
import useTitle from '../../hooks/useTitle';

const Welcome = () => {
    const { username, isAdmin, isDriver } = useAuth();
    useTitle('Home | Atlan Application');

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorText: "#fff",
                    colorTextBase: "#eee",
                    colorPrimary: '#1890ff',
                },
            }}
        >
            <Typography.Title level={2} style={{ color: '#fff' }}>
                Welcome {username}!
            </Typography.Title>

            <Space direction="vertical" size="middle">
                {!isAdmin && !isDriver && (
                    <>
                        {/* Links for Vehicles */}
                        <Link to="/atlan/bookings">
                            <Button type="primary" block>
                                View Bookings
                            </Button>
                        </Link>
        
                        <Link to="/atlan/bookings/new">
                            <Button style={{backgroundColor: "#222" }} block>
                                Add Booking
                            </Button>
                        </Link>
                    </>
                )}

                {isAdmin && (
                    <>
                        {/* Links for Vehicles */}
                        <Link to="/atlan/vehicles">
                            <Button type="primary" block>
                                Manage Vehicles
                            </Button>
                        </Link>
        
                        <Link to="/atlan/vehicles/new">
                            <Button style={{backgroundColor: "#222" }} block>
                                Add Vehicle
                            </Button>
                        </Link>

                        {/* Links for Managing Drivers */}
                        <Link to="/atlan/drivers">
                            <Button type="primary" block>
                                Manage Drivers
                            </Button>
                        </Link>

                        <Link to="/atlan/drivers/new">
                            <Button style={{backgroundColor: "#222" }} block>
                                Add Driver
                            </Button>
                        </Link>

                        {/* Links for Managing Admins */}
                        <Link to="/atlan/admins">
                            <Button type="primary" block>
                                Manage Admins
                            </Button>
                        </Link>

                        <Link to="/atlan/admins/new">
                            <Button style={{backgroundColor: "#222" }} block>
                                Add Admin
                            </Button>
                        </Link>
                    </>
                )}
            </Space>
        </ConfigProvider>
    );
};

export default Welcome;
