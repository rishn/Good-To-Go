import { useRef, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from './authSlice'
import { useLoginMutation } from './authApiSlice'
import { Form, Input, Button, Checkbox, message, Spin, Typography, ConfigProvider } from 'antd'
import usePersist from '../../hooks/usePersist'
import useTitle from '../../hooks/useTitle'

const Login = () => {
    useTitle('Login | Atlan Application')

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [persist, setPersist] = usePersist()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [login, { isLoading }] = useLoginMutation()

    useEffect(() => {
        if (username || password) {
            message.destroy()
        }
    }, [username, password])

    const handleSubmit = async () => {
        try {
            const { accessToken } = await login({ username, password }).unwrap()
            dispatch(setCredentials({ accessToken }))
            setUsername('')
            setPassword('')
            navigate('/dash')
        } catch (err) {
            if (!err.status) 
                message.error('No Server Response')
            else if (err.status === 400) 
                message.error('Missing Username or Password')
            else if (err.status === 401) 
                message.error('Unauthorized')
            else 
                message.error(err.data?.message || 'Login Failed')
        }
    }

    const handleToggle = () => setPersist((prev) => !prev)

    if (isLoading) return <Spin size="large" />

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
                <Typography.Title level={2}>Employee Login</Typography.Title>
                <Form
                    name="login-form"
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ persist }}
                >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input
                            style={{ width: '25%' }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                        />
                    </Form.Item>

                    <Form.Item
                        style={{ width: '25%' }}
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item name="persist" valuePropName="checked">
                        <Checkbox onChange={handleToggle} checked={persist}>
                            Trust This Device
                        </Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Sign In
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

export default Login
