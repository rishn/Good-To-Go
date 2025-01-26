import { useState, useEffect } from "react";
import { useUpdateUserMutation, useDeleteUserMutation } from "../users/usersApiSlice"; // Update the import based on your API slice
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Input, Button, Typography, Form, message, ConfigProvider, Row, Col, Rate, Select } from "antd";
import useTitle from "../../hooks/useTitle";

const EditAdminForm = ({ admin }) => {
    useTitle(`Edit ${admin.username} Details | Good to Go!`)
    const [updateAdmin, { isSuccess, isError, error }] = useUpdateUserMutation();
    const [deleteAdmin, { isSuccess: isDelSuccess }] = useDeleteUserMutation();
    
    const navigate = useNavigate();
    
    const [username, setUsername] = useState(admin.username);
    const [email, setEmail] = useState(admin.email);
    const [contactNumber, setContactNumber] = useState(admin.contactNumber);

    useEffect(() => {
        if (isSuccess) {
            message.success("Admin updated successfully!");
            navigate('/atlan/admins'); // Redirect to the drivers list
        }
        else if (isDelSuccess) {
            message.success("Admin deleted successfully!");
            navigate('/atlan/admins'); // Redirect to the drivers list
        }
    }, [isSuccess, isDelSuccess, navigate]);

    const onFinish = async (values) => {
        await updateAdmin({ 
            id: admin.id, 
            ...values, 
            username,
            email,
            contactNumber,
            role: 'Admin'
        });
    };

    const onDeleteAdminClicked = async () => {
        await deleteAdmin({ id: admin.id });
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
                <Typography.Title level={2}>Edit Driver</Typography.Title>
                <Typography.Title level={3}>{admin.username}</Typography.Title>

                <Form.Item label="Username" name="username" initialValue={username}>
                    <Input placeholder="Enter Admin Username" />
                </Form.Item>

                <Form.Item label="Email" name="email" initialValue={email}>
                    <Input placeholder="Enter Admin Email" />
                </Form.Item>

                <Form.Item label="Contact Number" name="contactNumber" initialValue={contactNumber}>
                    <Input placeholder="Enter Admin Contact Number" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<FontAwesomeIcon icon={faSave} />} style={{ marginRight: 8 }}>
                        Save
                    </Button>
                    <Button danger onClick={onDeleteAdminClicked} icon={<FontAwesomeIcon icon={faTrashCan} />}>
                        Delete
                    </Button>
                </Form.Item>

                {isError && <Typography.Text type="danger">{error?.data?.message}</Typography.Text>}
            </Form>
        </ConfigProvider>
    );
};

export default EditAdminForm;
