import { useState, useEffect } from "react";
import { useAddNewVehicleMutation } from "./vehiclesApiSlice"; // Import the vehicle mutation
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Input, Button, Typography, Form, message, ConfigProvider, Select, Row, Col } from "antd";
import useTitle from "../../hooks/useTitle";

const NewVehicleForm = () => {
    useTitle('Add Vehicle | Good to Go!')
    const [addNewVehicle, { isSuccess, isError, error }] = useAddNewVehicleMutation();
    const navigate = useNavigate();

    // State variables for vehicle details
    const [type, setType] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [capacity, setCapacity] = useState('');

    // Success or error messages based on vehicle creation
    useEffect(() => {
        if (isSuccess) {
            message.success("Vehicle created successfully!");
            navigate('/atlan/vehicles'); // Redirect to the vehicles list
        } else if (isError) {
            message.error(`Vehicle creation failed: ${error?.data?.message || error?.message}`);
        }
    }, [isSuccess, isError, navigate, error]);

    const onFinish = async (values) => {
        const payload = {
            type: values.type,
            licensePlate: values.licensePlate,
            capacity: parseInt(values.capacity), // Ensure capacity is a number
            driverId: values.driverId // Associate the vehicle with the selected driver
        };

        await addNewVehicle(payload);
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorText: "#fff",
                    colorTextPlaceholder: "#aaa",
                },
                components: {
                    Select: {
                        colorBgBase: "rgba(100, 100, 100, 0.4)",
                        colorBgContainer: "rgba(100, 100, 100, 0.4)"
                    },
                    Input: {
                        colorBgContainer: 'rgba(100, 100, 100, 0.4)', 
                        colorText: "#fff", // White text
                    }
                }
            }}
        >
            <Form
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 600, margin: 'auto' }}
            >
                <Typography.Title level={2}>New Vehicle</Typography.Title>

                {/* Vehicle Type */}
                <Form.Item label="Type" name="type" rules={[{ required: true, message: "Please select a vehicle type" }]}>
                    <Select
                        placeholder="Select Vehicle Type"
                        onChange={(value) => setType(value)}
                        options={[
                            { label: 'Bike', value: 'bike' },
                            { label: 'Car', value: 'car' },
                            { label: 'Truck', value: 'truck' },
                        ]}
                    />
                </Form.Item>

                {/* License Plate */}
                <Form.Item
                    label="License Plate"
                    name="licensePlate"
                    rules={[{ required: true, message: 'License plate is required!' }]}
                >
                    <Input
                        placeholder="Enter License Plate"
                        onChange={(e) => setLicensePlate(e.target.value)}
                    />
                </Form.Item>

                {/* Capacity */}
                <Form.Item
                    label="Capacity (in kg)"
                    name="capacity"
                    rules={[{ required: true, message: 'Capacity is required!' }]}
                >
                    <Input
                        placeholder="Enter Capacity"
                        onChange={(e) => setCapacity(e.target.value)}
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

export default NewVehicleForm;
