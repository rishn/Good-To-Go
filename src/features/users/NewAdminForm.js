import { useState, useEffect } from "react";
import { useAddNewUserMutation } from "../users/usersApiSlice"; // Import the user mutation
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Input, Button, Typography, Form, message, ConfigProvider, Row, Col } from "antd";
import useTitle from "../../hooks/useTitle";

const NewAdminForm = () => {
    useTitle('Add Admin | Good to Go!')
    const [createNewUser, { isSuccess, isError, error }] = useAddNewUserMutation();
    const navigate = useNavigate();

    // State variables for user and driver details
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');

    // Success or error messages based on user and driver creation
    useEffect(() => {
        if (isSuccess) {
            message.success("User created successfully!");
            navigate('/atlan/admins');
        } else if (isError) {
            message.error(`User creation failed: ${error?.data?.message || error?.message}`);
        } 
    }, [isSuccess, isError, navigate, error]);

    const onFinish = async (values) => {
        // First create the user
        const userPayload = {
            username: values.username,
            password: values.password,
            role: 'Admin',
            email: values.email,
            contactNumber: values.contactNumber
        };

        await createNewUser(userPayload);
    };

    return (
        <ConfigProvider theme={{
          components: {
            Input: {
              colorBgContainer: 'rgba(100, 100, 100, 0.4)', 
              colorText: "#fff", // White text
            }
          },
          token: {
            colorTextPlaceholder: "#aaa"
          }
        }}>
            <Form
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 600, margin: 'auto' }}
            >
                <Typography.Title level={2}>New Admin</Typography.Title>

                {/* User Details */}
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Username is required!' }]}
                >
                    <Input
                        placeholder="Enter Username"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Password is required!' }]}
                >
                    <Input.Password
                        placeholder="Enter Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Email is required!' }]}
                >
                    <Input
                        placeholder="Enter Email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    label="Contact Number"
                    name="contactNumber"
                    rules={[{ required: true, message: 'Contact number is required!' }]}
                >
                    <Input
                        placeholder="Enter Contact Number"
                        onChange={(e) => setContactNumber(e.target.value)}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<FontAwesomeIcon icon={faSave} />} style={{ marginRight: 8 }}>
                        Save
                    </Button>
                </Form.Item>

                {isError && (
                    <Typography.Text type="danger">
                        {error?.data?.message}
                    </Typography.Text>
                )}
            </Form>
        </ConfigProvider>
    );
};

export default NewAdminForm;
