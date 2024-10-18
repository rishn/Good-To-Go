import { useState, useEffect } from "react";
import { useUpdateDriverMutation, useDeleteDriverMutation } from "./driversApiSlice"; // Update the import based on your API slice
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Input, Checkbox, Button, Typography, Form, message, ConfigProvider, Row, Col, Rate, Select } from "antd";
import useTitle from "../../hooks/useTitle";

const EditDriverForm = ({ driver, vehicles }) => {
    useTitle(`Edit ${driver.userId.username} Details | Atlan Application`)
    const [updateDriver, { isSuccess, isError, error }] = useUpdateDriverMutation();
    const [deleteDriver, { isSuccess: isDelSuccess }] = useDeleteDriverMutation();
    
    const navigate = useNavigate();
    // Separate states for currentLocation lat and lng
    const [lat, setLat] = useState(driver.currentLocation.lat);
    const [lng, setLng] = useState(driver.currentLocation.lng);
    
    const [driverNum, setDriverNum] = useState(driver.driverNum);
    const [vehicleId, setVehicleId] = useState(driver.vehicle?._id); // Store vehicle ID
    const [availability, setAvailability] = useState(driver.availability);
    const [rating, setRating] = useState(driver.rating);

    useEffect(() => {
        if (isSuccess) {
            message.success("Driver updated successfully!");
            navigate('/atlan/drivers'); // Redirect to the drivers list
        }
        else if (isDelSuccess) {
            message.success("Driver deleted successfully!");
            navigate('/atlan/drivers'); // Redirect to the drivers list
        }
    }, [isSuccess, isDelSuccess, navigate]);

    const onFinish = async (values) => {
        // Construct currentLocation object from lat and lng values
        const currentLocation = {
            lat: parseFloat(values.lat), // Ensuring lat is a number
            lng: parseFloat(values.lng)  // Ensuring lng is a number
        };
        
        await updateDriver({ 
            id: driver.id, 
            ...values, 
            currentLocation, // Add currentLocation in the payload 
            vehicle: vehicleId,  // Pass selected vehicle's ID
            rating // Include the star rating state
        });
    };

    const onDeleteDriverClicked = async () => {
        await deleteDriver({ id: driver.id });
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
                <Typography.Title level={2}>Edit Driver</Typography.Title>
                <Typography.Title level={3}>{driver.userId.username}</Typography.Title>

                <Form.Item label="Driver Number" name="driverNum" initialValue={driverNum}>
                    <Input placeholder="Enter Driver Number" style={{ backgroundColor: "#222" }} />
                </Form.Item>

                {/* Fields for Latitude and Longitude */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Latitude"
                            name="lat"
                            rules={[{ required: true, message: 'Latitude is required!' }]}
                            initialValue={lat}
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
                            initialValue={lng}
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
                    initialValue={vehicleId}
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

                <Form.Item label="Availability" name="availability" valuePropName="checked">
                    <Checkbox checked={availability} onChange={e => setAvailability(e.target.checked)}>
                        Available
                    </Checkbox>
                </Form.Item>

                {/* Use Rate for Star Rating */}
                <Form.Item label="Rating" name="rating" initialValue={rating}>
                    <Rate 
                        value={rating} 
                        onChange={setRating} 
                        style={{ color: '#fadb14' }} // Yellow for selected stars
                        defaultValue={rating}
                        character={({ index }) => (
                            <span style={{ color: index < rating ? '#fadb14' : '#888', fontSize: 35 }}>
                                ★
                            </span>
                        )}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<FontAwesomeIcon icon={faSave} />} style={{ marginRight: 8 }}>
                        Save
                    </Button>
                    <Button danger onClick={onDeleteDriverClicked} icon={<FontAwesomeIcon icon={faTrashCan} />}>
                        Delete
                    </Button>
                </Form.Item>

                {isError && <Typography.Text type="danger">{error?.data?.message}</Typography.Text>}
            </Form>
        </ConfigProvider>
    );
};

export default EditDriverForm;
