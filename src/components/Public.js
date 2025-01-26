import { Link } from 'react-router-dom';
import { Typography, Button, ConfigProvider, Space, Divider } from 'antd';
import Logo from '../img/logo.png'

const { Title, Paragraph } = Typography;

const Public = () => {
    return (
        <section className="public">
            <ConfigProvider
                theme={{
                    token: {
                        colorText: "#fff",
                        colorTextBase: "#eee",
                        colorPrimary: '#375f7b',
                    },
                }}
            >
                <header>
                    <Title level={1} style={{ color: "#fff" }}>
                        <span className="nowrap"><img src={Logo} style={{ width: '2.5%', marginRight: '2px' }}/> Good to Go!</span>
                    </Title>
                </header>
                <main className="public__main">
                <Paragraph style={{ color: "#fff", fontSize: 20 }}>
                    Scalable logistics platform designed for goods transportation, utilizing the MERN stack with React for the front-end, Express and Node.js for the back-end, and MongoDB for database management.
                </Paragraph>
                <Paragraph style={{ color: "#fff", fontSize: 20 }}>
                    Built to handle high traffic, this platform supports real-time vehicle tracking, efficient booking services, and a dynamic pricing model.
                </Paragraph>

                <Divider />
                <Button type="primary" style={{ marginRight: 25, backgroundColor: "rgba(100, 100, 100, 0.4)" }}>
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
