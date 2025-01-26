import { Link } from 'react-router-dom';
import { Typography, Button, Space, ConfigProvider } from 'antd';
import useAuth from '../../hooks/useAuth';
import useTitle from '../../hooks/useTitle';

const Welcome = () => {
    const { username, isAdmin, isDriver } = useAuth();
    useTitle('Home | Good to Go!');

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorText: "#fff",
                    colorTextBase: "#eee",
                },
            }}
        >
            <Typography.Title level={2} style={{ color: '#fff' }}>
                Welcome {username}!
            </Typography.Title>

            <Space direction="vertical" size="middle">
                <>
                    <Link to="/atlan/bookings">
                        <Button style={{backgroundColor: "rgba(100, 100, 100, 0.4)" }} type="primary" block>
                            View Bookings
                        </Button>
                    </Link>
    
                    {!isAdmin && !isDriver && (
                        <Link to="/atlan/bookings/new">
                            <Button type="primary" block>
                                Add Booking
                            </Button>
                        </Link>
                    )}
                </>

                {isAdmin && (
                    <>
                        {/* Links for Vehicles */}
                        <Link to="/atlan/vehicles">
                            <Button type="primary" style={{backgroundColor: "rgba(100, 100, 100, 0.4)" }} block>
                                Manage Vehicles
                            </Button>
                        </Link>
        
                        <Link to="/atlan/vehicles/new">
                            <Button type="primary" block>
                                Add Vehicle
                            </Button>
                        </Link>

                        {/* Links for Managing Drivers */}
                        <Link to="/atlan/drivers">
                            <Button type="primary" style={{backgroundColor: "rgba(100, 100, 100, 0.4)" }} block>
                                Manage Drivers
                            </Button>
                        </Link>

                        <Link to="/atlan/drivers/new">
                            <Button type="primary" block>
                                Add Driver
                            </Button>
                        </Link>

                        {/* Links for Managing Admins */}
                        <Link to="/atlan/admins">
                            <Button type="primary" style={{backgroundColor: "rgba(100, 100, 100, 0.4)" }} block>
                                Manage Admins
                            </Button>
                        </Link>

                        <Link to="/atlan/admins/new">
                            <Button type="primary" block>
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
