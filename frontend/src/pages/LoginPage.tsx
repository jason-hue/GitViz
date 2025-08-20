import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined, GithubOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../store/slices/authSlice'
import { authAPI } from '../services/api'

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const response = await authAPI.login(values)
      const { user, token } = response.data
      
      localStorage.setItem('token', token)
      dispatch(loginSuccess({ user, token }))
      
      message.success('登录成功！')
      navigate('/dashboard')
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values: { username: string; email: string; password: string }) => {
    setLoading(true)
    try {
      const response = await authAPI.register(values)
      const { user, token } = response.data
      
      localStorage.setItem('token', token)
      dispatch(loginSuccess({ user, token }))
      
      message.success('注册成功！')
      navigate('/dashboard')
    } catch (error: any) {
      message.error(error.response?.data?.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/github`
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ color: '#1890ff', margin: 0 }}>GitViz</h1>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>Git可视化管理工具</p>
        </div>
        
        <Tabs 
          defaultActiveKey="login" 
          centered
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form
                  name="login"
                  onFinish={handleLogin}
                  autoComplete="off"
                  size="large"
                >
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: '请输入用户名！' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="用户名" 
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码！' }]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="密码" 
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      style={{ width: '100%' }}
                    >
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form
                  name="register"
                  onFinish={handleRegister}
                  autoComplete="off"
                  size="large"
                >
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: '请输入用户名！' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="用户名" 
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: '请输入邮箱！' },
                      { type: 'email', message: '请输入有效的邮箱地址！' }
                    ]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="邮箱" 
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码！' }]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="密码" 
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      style={{ width: '100%' }}
                    >
                      注册
                    </Button>
                  </Form.Item>
                </Form>
              )
            }
          ]}
        />

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button 
            icon={<GithubOutlined />} 
            onClick={handleGithubLogin}
            style={{ width: '100%' }}
          >
            使用GitHub登录
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage