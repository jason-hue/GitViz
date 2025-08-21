import React, { useState } from 'react'
import { Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { authAPI } from '../services/api'
import { loginSuccess } from '../store/slices/authSlice'

const TestRegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' })
  const [debugInfo, setDebugInfo] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleRegister = async () => {
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      message.error('请填写所有字段')
      return
    }
    
    setDebugInfo('开始注册流程...')
    setLoading(true)
    try {
      setDebugInfo('调用API...')
      console.log('注册数据:', registerForm)
      
      const response = await authAPI.register(registerForm)
      console.log('注册响应:', response)
      const { user, token } = response.data
      
      // 保存token到localStorage
      localStorage.setItem('token', token)
      
      // 更新Redux状态
      dispatch(loginSuccess({ user, token }))
      
      setDebugInfo(`注册成功! 用户: ${user.username}, Token: ${token.substring(0, 20)}...`)
      message.success('注册成功！即将跳转到仪表板...')
      
      // 2秒后跳转到仪表板
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error: unknown) {
      console.error('注册错误:', error)
      
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
        
        if (axiosError.response?.data?.errors) {
          // 处理后端返回的验证错误数组
          const validationErrors = axiosError.response.data.errors
          errorMessage = validationErrors.map(err => err.msg).join(', ')
        } else if (axiosError.response?.data?.message) {
          // 处理其他错误消息
          errorMessage = axiosError.response.data.message
        }
      } else if (error instanceof Error) {
        // 处理网络错误等
        errorMessage = error.message
      }
      
      setDebugInfo(`注册失败! 错误: ${errorMessage}\n响应: ${JSON.stringify(
        error && typeof error === 'object' && 'response' in error 
          ? (error as { response?: any }).response?.data 
          : error
      )}`)
      message.error(errorMessage)
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card style={{ width: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ color: '#1890ff', margin: 0 }}>GitViz - 注册测试</h1>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>测试注册功能</p>
        </div>
        
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
            style={{ width: '100%', marginBottom: 16 }}
          >
            注册
          </Button>
          
          {/* 成功状态显示 */}
          {debugInfo.includes('注册成功') && (
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              background: '#f6ffed', 
              border: '1px solid #b7eb8f',
              borderRadius: 4,
              color: '#52c41a',
              fontSize: '14px'
            }}>
              <strong>✅ 注册成功！</strong>
              <p style={{ margin: '8px 0 0 0' }}>
                正在为您跳转到仪表板...
              </p>
            </div>
          )}
        </div>

        {/* 调试信息 */}
        <div style={{ 
          marginTop: 20, 
          padding: 10, 
          background: '#f5f5f5', 
          borderRadius: 4,
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <strong>调试信息:</strong>
          <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
            {debugInfo || '等待操作...'}
          </div>
        </div>

        {/* API配置信息 */}
        <div style={{ 
          marginTop: 16, 
          padding: 10, 
          background: '#e6f7ff', 
          borderRadius: 4,
          fontSize: '12px'
        }}>
          <strong>API配置:</strong>
          <div>Base URL: {import.meta.env.VITE_API_BASE_URL}</div>
          <div>代理目标: {window.location.origin}/api</div>
          <div>完整API URL: {window.location.origin}{import.meta.env.VITE_API_BASE_URL}</div>
          <div>实际后端地址: http://localhost:8000/api</div>
        </div>
      </Card>
    </div>
  )
}

export default TestRegisterPage