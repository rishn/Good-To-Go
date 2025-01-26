import { useState, useEffect } from "react";
import { useUpdateVehicleMutation, useDeleteVehicleMutation } from "./vehiclesApiSlice"; // Adjust import
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Input, Button, Typography, Form, message, ConfigProvider, Select } from "antd";
import useTitle from "../../hooks/useTitle";

const EditVehicleForm = ({ vehicle }) => {
    useTitle(`Edit ${vehicle.licensePlate} Details | Good to Go!`)
    const [updateVehicle, { isSuccess, isError, error }] = useUpdateVehicleMutation();
    const [deleteVehicle, { isSuccess: isDelSuccess }] = useDeleteVehicleMutation();
    const navigate = useNavigate();

    const [type, setType] = useState(vehicle.type);
    const [licensePlate, setLicensePlate] = useState(vehicle.licensePlate);
    const [capacity, setCapacity] = useState(vehicle.capacity);

    useEffect(() => {
        if (isSuccess) {
            message.success("Vehicle updated successfully!");
            navigate('/atlan/vehicles'); // Redirect to the vehicle list
        }
        else if (isDelSuccess) {
            message.success("Vehicle deleted successfully!");
            navigate('/atlan/vehicles'); // Redirect to the vehicle list
        }
    }, [isSuccess, isDelSuccess, navigate]);

    const onFinish = async (values) => {
        await updateVehicle({ 
            id: vehicle._id, 
            ...values 
        });
    };

    const onDeleteVehicleClicked = async () => {
        await deleteVehicle({ id: vehicle.id });
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
            <Form layout="vertical" onFinish={onFinish} style={{ maxWidth: 600, margin: 'auto' }}>
                <Typography.Title level={2}>Edit Vehicle</Typography.Title>
                
                <Form.Item label="Type" name="type" initialValue={type} rules={[{ required: true, message: "Please select a vehicle type" }]}>
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

                <Form.Item label="License Plate" name="licensePlate" initialValue={licensePlate} rules={[{ required: true, message: "Please enter the license plate" }]}>
                    <Input
                        placeholder="Enter License Plate"
                        onChange={(e) => setLicensePlate(e.target.value)}
                    />
                </Form.Item>

                <Form.Item label="Capacity" name="capacity" initialValue={capacity} rules={[{ required: true, message: "Please enter the capacity" }]}>
                    <Input
                        placeholder="Enter Vehicle Capacity"
                        onChange={(e) => setCapacity(e.target.value)}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<FontAwesomeIcon icon={faSave} />} style={{ marginRight: 8 }}>
                        Save
                    </Button>
                    <Button danger onClick={onDeleteVehicleClicked} icon={<FontAwesomeIcon icon={faTrashCan} />}>
                        Delete
                    </Button>
                </Form.Item>

                {isError && <Typography.Text type="danger">{error?.data?.message}</Typography.Text>}
            </Form>
        </ConfigProvider>
    );
};

export default EditVehicleForm;
