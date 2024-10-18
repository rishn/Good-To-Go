import { useState, useEffect } from "react";
import { useAddNewDriverMutation } from "./driversApiSlice"; // Update the import based on your API slice
import { useAddNewUserMutation } from "../users/usersApiSlice"; // Import the user mutation
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Input, Button, Typography, Form, message, ConfigProvider, Row, Col, Select } from "antd";
import useTitle from "../../hooks/useTitle";

const NewDriverForm = ({vehicles}) => {
    useTitle('Add Driver | Atlan Application')
    const [createNewDriver, { isSuccess: driverSuccess, isError: driverError, error: driverErrorMsg }] = useAddNewDriverMutation();
    const [createNewUser, { isSuccess: userSuccess, isError: userError, error: userErrorMsg }] = useAddNewUserMutation();
    const navigate = useNavigate();

    // State variables for user and driver details
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [driverNum, setDriverNum] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [vehicleId, setVehicleId] = useState(''); // Store vehicle ID
    const [driver, setDriver] = useState()

    // Success or error messages based on user and driver creation
    useEffect(() => {
        if (userSuccess) {
            message.success("User created successfully!");
        } else if (userError) {
            message.error(`User creation failed: ${userErrorMsg?.data?.message || userErrorMsg?.message}`);
        } else if (driverError) {
            message.error(`Driver creation failed: ${driverErrorMsg?.data?.message || driverErrorMsg?.message}`);
        }
        
        if (userSuccess && driverSuccess) {
            message.success("Driver created successfully!");
            navigate('/dash/drivers'); // Redirect to the drivers list
        }
    }, [userSuccess, driverSuccess, userError, driverError, navigate, userErrorMsg, driverErrorMsg]);

    const onFinish = async (values) => {
        // Construct currentLocation object from lat and lng values
        const currentLocation = {
            lat: parseFloat(values.lat), // Ensuring lat is a number
            lng: parseFloat(values.lng)  // Ensuring lng is a number
        };

        // First create the user
        const userPayload = {
            username: values.username,
            password: values.password,
            role: 'Driver', // Set the role as 'driver'
            email: values.email,
            contactNumber: values.contactNumber
        };

        const userResponse = await createNewUser(userPayload);

        if (userResponse.data) {
            // User created successfully, now create the driver with the new user ID
            const driverPayload = { 
                userId: userResponse.data.data._id, // Use the newly created user's ID
                driverNum: values.driverNum,
                currentLocation, // Add currentLocation in the payload 
                vehicle: vehicleId,  // Pass selected vehicle's ID
            };
            
            await createNewDriver(driverPayload);
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorText: "#fff",
                    colorTextBase: "#eee"
                },
            }}
        >
            <Form
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 600, margin: 'auto' }}
            >
                <Typography.Title level={2}>New Driver</Typography.Title>

                {/* User Details */}
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Username is required!' }]}
                >
                    <Input
                        placeholder="Enter Username"
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ backgroundColor: "#222" }}
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
                        style={{ backgroundColor: "#222" }}
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
                        style={{ backgroundColor: "#222" }}
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
                        style={{ backgroundColor: "#222" }}
                    />
                </Form.Item>

                {/* Driver Details */}
                <Form.Item
                    label="Driver Number"
                    name="driverNum"
                    rules={[{ required: true, message: 'Driver number is required!' }]}
                >
                    <Input
                        placeholder="Enter Driver Number"
                        onChange={(e) => setDriverNum(e.target.value)}
                        style={{ backgroundColor: "#222" }}
                    />
                </Form.Item>

                {/* Fields for Latitude and Longitude */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Latitude"
                            name="lat"
                            rules={[{ required: true, message: 'Latitude is required!' }]}
                        >
                            <Input
                                placeholder="Enter Latitude"
                                onChange={(e) => setLat(e.target.value)}  
                                style={{ backgroundColor: "#222" }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Longitude"
                            name="lng"
                            rules={[{ required: true, message: 'Longitude is required!' }]}
                        >
                            <Input
                                placeholder="Enter Longitude"
                                onChange={(e) => setLng(e.target.value)}  
                                style={{ backgroundColor: "#222" }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Vehicle Selection Dropdown */}
                <Form.Item
                    label="Select Vehicle"
                    name="vehicle"
                    rules={[{ required: true, message: 'Please select a vehicle' }]}
                >
                    <Select
                        placeholder="Select a Vehicle"
                        value={vehicleId}
                        onChange={setVehicleId}
                        style={{ backgroundColor: "#222" }}
                    >
                        {vehicles?.map(vehicle => (
                            <Select.Option key={vehicle._id} value={vehicle._id}>
                                {vehicle.licensePlate} - {vehicle.type}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<FontAwesomeIcon icon={faSave} />} style={{ marginRight: 8 }}>
                        Save
                    </Button>
                </Form.Item>

                {(userError || driverError) && (
                    <Typography.Text type="danger">
                        {userError?.data?.message || driverError?.data?.message}
                    </Typography.Text>
                )}
            </Form>
        </ConfigProvider>
    );
};

export default NewDriverForm;
