import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, ConfigProvider, Typography, message } from 'antd'
import { useAddNewUserMutation } from '../users/usersApiSlice'
import useTitle from '../../hooks/useTitle'
import Link from 'antd/es/typography/Link'

const Signup = () => {
    useTitle('Customer Signup | Atlan Application')

    const [addNewUser, { isLoading }] = useAddNewUserMutation()
    const navigate = useNavigate()

    const [form] = Form.useForm()

    const onFinish = async (values) => {
        const { username, password, email, contactNumber } = values
        try {
            await addNewUser({ username, password, email, contactNumber, role: 'Customer' }).unwrap()
            message.success('User created successfully')
            navigate('/login')
        } catch (err) {
            if (err.status === 409) 
                message.error('Duplicate username or email')
            else 
                message.error(err.data?.message || 'Failed to create user')
        }
    }

    return (
        <section className="public">
            <ConfigProvider theme={{
                token: {
                    colorText: "#fff"
                },
                components: {
                    Input: {
                        colorBgContainer: "#222"
                    }
                }
            }}>
                <Typography.Title level={2}>Customer Signup</Typography.Title>
                <Form
                    form={form}
                    name="signup-form"
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        style={{ width: '25%' }}
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        style={{ width: '25%' }}
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        style={{ width: '25%' }}
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please input your email!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        style={{ width: '25%' }}
                        label="Contact Number"
                        name="contactNumber"
                        rules={[{ required: true, message: 'Please input your contact number!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={isLoading}>
                            Sign Up
                        </Button>
                    </Form.Item>
                </Form>
                <footer>
                    <Link to="/">Back to Main</Link>
                </footer>
            </ConfigProvider>
        </section>
    )
}

export default Signup
