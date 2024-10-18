import { Link } from 'react-router-dom';
import { Typography, Button, ConfigProvider, Space, Divider } from 'antd';

const { Title, Paragraph } = Typography;

const Public = () => {
    return (
        <section className="public">
            <ConfigProvider
                theme={{
                    token: {
                        colorText: "#fff",
                        colorTextBase: "#eee",
                        colorPrimary: '#1890ff',
                    },
                }}
            >
                <header>
                    <Title level={1} style={{ color: "#fff" }}>
                        <span className="nowrap">Atlan Application</span>
                    </Title>
                </header>
                <main className="public__main">
                <Paragraph style={{ color: "#fff", fontSize: 20 }}>
                    Scalable logistics platform designed for goods transportation, utilizing the MERN stack with React for the front-end, Express and Node.js for the back-end, and MongoDB for database management.
                </Paragraph>
                <Paragraph style={{ color: "#fff", fontSize: 20 }}>
                    Built to handle high traffic, this platform supports real-time vehicle tracking, efficient booking services, and a dynamic pricing model. The project focuses on scalability and performance, capable of managing 10,000 requests per second with millions of users and thousands of drivers.
                </Paragraph>

                <address className="public__addr" style={{ fontSize: 17 }}>
                    Made by: Rishaan Jacob Kuriakose
                </address>

                <Divider />
                <Button style={{ marginRight: 25, backgroundColor: "#222" }}>
                    <Link to="/login">User Login</Link>
                </Button>

                <Button type="primary">
                    <Link to="/signup">Create Account</Link>
                </Button>
                </main>
            </ConfigProvider>
        </section>
    );
};

export default Public;
