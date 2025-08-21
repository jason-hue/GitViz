import React, { useState, useEffect } from 'react'
import { Input, Button, Card, message, Tabs, App } from 'antd'
import { UserOutlined, LockOutlined, GithubOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../store/slices/authSlice'
import { authAPI } from '../services/api'

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // 清除消息
  const clearMessages = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  // 显示错误消息
  const showError = (msg: string) => {
    setErrorMessage(msg)
    setSuccessMessage('')
    // 5秒后自动清除
    setTimeout(clearMessages, 5000)
  }

  // 显示成功消息
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setErrorMessage('')
    // 3秒后自动清除
    setTimeout(clearMessages, 3000)
  }

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      message.warning({
        content: '请输入用户名和密码',
        duration: 3,
      })
      showError('请输入用户名和密码')
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
      
      message.success({
        content: '登录成功！正在跳转...',
        duration: 2,
      })
      
      showSuccess('登录成功！正在跳转...')
      
      // 2秒后跳转
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error: unknown) {
      console.error('Login error:', error)
      
      // 处理错误消息
      let errorMessage = '登录失败'
      if (error instanceof Error) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { message?: string } } }
          if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message
          }
        } else {
          errorMessage = error.message
        }
      }
      
      message.error({
        content: errorMessage,
        duration: 4,
        style: {
          marginTop: '20px',
        },
      })
      
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      message.warning({
        content: '请填写所有字段',
        duration: 3,
      })
      showError('请填写所有字段')
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
      
      message.success({
        content: '注册成功！正在跳转...',
        duration: 2,
      })
      
      showSuccess('注册成功！正在跳转...')
      
      // 2秒后跳转
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error: unknown) {
      console.error('Register error:', error)
      
      // 处理验证错误
      let errorMessage = '注册失败'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data?: { 
              errors?: Array<{ msg: string }>, 
              message?: string 
            } 
          } 
        }
        
        console.log('Axios error response:', axiosError.response?.data)
        
        if (axiosError.response?.data?.errors) {
          // 处理后端返回的验证错误数组
          const validationErrors = axiosError.response.data.errors
          errorMessage = validationErrors.map(err => err.msg).join(', ')
          console.log('Validation errors:', validationErrors)
          console.log('Processed error message:', errorMessage)
        } else if (axiosError.response?.data?.message) {
          // 处理其他错误消息
          errorMessage = axiosError.response.data.message
          console.log('Error message:', errorMessage)
        }
      } else if (error instanceof Error) {
        // 处理网络错误等
        errorMessage = error.message
        console.log('Network error:', errorMessage)
      }
      
      console.log('Final error message to display:', errorMessage)
      
      // 使用 Ant Design 的消息提示显示错误
      message.error({
        content: errorMessage,
        duration: 4,
        style: {
          marginTop: '20px',
        },
      })
      
      showError(errorMessage)
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
        {/* 消息显示区域 */}
        {errorMessage && (
          <div style={{ 
            marginBottom: 16, 
            padding: 12, 
            background: '#fff2f0', 
            border: '1px solid #ffccc7',
            borderRadius: 6,
            color: '#ff4d4f',
            fontSize: '14px'
          }}>
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div style={{ 
            marginBottom: 16, 
            padding: 12, 
            background: '#f6ffed', 
            border: '1px solid #b7eb8f',
            borderRadius: 6,
            color: '#52c41a',
            fontSize: '14px'
          }}>
            {successMessage}
          </div>
        )}
        
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

const LoginPageWithApp: React.FC = () => {
  return (
    <App>
      <LoginPage />
    </App>
  )
}

export default LoginPageWithApp