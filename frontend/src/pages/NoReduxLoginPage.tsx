import React, { useState } from 'react'
import { Input, Button, Card, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const NoReduxLoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' })
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      message.error('请输入用户名和密码')
      return
    }
    
    setLoading(true)
    try {
      console.log('Attempting login...', loginForm)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      })
      const data = await response.json()
      console.log('Login response:', data)
      
      if (response.ok) {
        localStorage.setItem('token', data.token)
        message.success('登录成功！')
        navigate('/dashboard')
      } else {
        message.error(data.message || '登录失败')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      message.error('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      message.error('请填写所有字段')
      return
    }
    
    setLoading(true)
    try {
      console.log('Attempting register...', registerForm)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm),
      })
      const data = await response.json()
      console.log('Register response:', data)
      
      if (response.ok) {
        localStorage.setItem('token', data.token)
        message.success('注册成功！')
        navigate('/dashboard')
      } else {
        message.error(data.message || '注册失败')
      }
    } catch (error: any) {
      console.error('Register error:', error)
      message.error('网络错误')
    } finally {
      setLoading(false)
    }
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
                <div>
                  <Input
                    placeholder="用户名"
                    prefix={<UserOutlined />}
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                    style={{ marginBottom: 16 }}
                  />
                  <Input.Password
                    placeholder="密码"
                    prefix={<LockOutlined />}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    style={{ marginBottom: 16 }}
                  />
                  <Button 
                    type="primary" 
                    loading={loading}
                    onClick={handleLogin}
                    style={{ width: '100%' }}
                  >
                    登录
                  </Button>
                </div>
              )
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <div>
                  <Input
                    placeholder="用户名"
                    prefix={<UserOutlined />}
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                    style={{ marginBottom: 16 }}
                  />
                  <Input
                    placeholder="邮箱"
                    prefix={<UserOutlined />}
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    style={{ marginBottom: 16 }}
                  />
                  <Input.Password
                    placeholder="密码"
                    prefix={<LockOutlined />}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    style={{ marginBottom: 16 }}
                  />
                  <Button 
                    type="primary" 
                    loading={loading}
                    onClick={handleRegister}
                    style={{ width: '100%' }}
                  >
                    注册
                  </Button>
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  )
}

export default NoReduxLoginPage