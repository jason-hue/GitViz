import React, { useState } from 'react'
import { Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../store/slices/authSlice'
import { authAPI } from '../services/api'

const SimpleWorkingLoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' })
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      message.error('请输入用户名和密码')
      return
    }
    
    console.log('handleLogin called with:', loginForm)
    setLoading(true)
    try {
      console.log('Calling authAPI.login...')
      const response = await authAPI.login(loginForm)
      console.log('API response:', response)
      const { user, token } = response.data
      
      localStorage.setItem('token', token)
      console.log('Dispatching loginSuccess...')
      dispatch(loginSuccess({ user, token }))
      console.log('LoginSuccess dispatched')
      
      message.success('登录成功！')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      message.error(error.response?.data?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      message.error('请填写所有字段')
      return
    }
    
    console.log('handleRegister called with:', registerForm)
    setLoading(true)
    try {
      console.log('Calling authAPI.register...')
      const response = await authAPI.register(registerForm)
      console.log('Register response:', response)
      const { user, token } = response.data
      
      localStorage.setItem('token', token)
      console.log('Dispatching loginSuccess...')
      dispatch(loginSuccess({ user, token }))
      console.log('LoginSuccess dispatched')
      
      message.success('注册成功！')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Register error:', error)
      message.error(error.response?.data?.message || '注册失败')
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
        
        {/* Simple toggle buttons instead of Tabs */}
        <div style={{ display: 'flex', marginBottom: 24 }}>
          <Button 
            type={isLogin ? 'primary' : 'default'}
            onClick={() => setIsLogin(true)}
            style={{ flex: 1, marginRight: 8 }}
          >
            登录
          </Button>
          <Button 
            type={!isLogin ? 'primary' : 'default'}
            onClick={() => setIsLogin(false)}
            style={{ flex: 1, marginLeft: 8 }}
          >
            注册
          </Button>
        </div>
        
        {isLogin ? (
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
        ) : (
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
        )}
      </Card>
    </div>
  )
}

export default SimpleWorkingLoginPage