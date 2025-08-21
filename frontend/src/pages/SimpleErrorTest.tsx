import React, { useState } from 'react'
import { Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

const SimpleErrorTest: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' })
  const [debugInfo, setDebugInfo] = useState('')

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
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm)
      })
      
      console.log('响应状态:', response.status)
      console.log('响应头:', response.headers)
      
      const data = await response.json()
      console.log('响应数据:', data)
      
      if (response.ok) {
        setDebugInfo(`注册成功! 数据: ${JSON.stringify(data)}`)
        message.success('注册成功！')
      } else {
        // 处理错误
        let errorMessage = '注册失败'
        if (data.errors) {
          const validationErrors = data.errors
          errorMessage = validationErrors.map(err => err.msg).join(', ')
        } else if (data.message) {
          errorMessage = data.message
        }
        
        setDebugInfo(`注册失败! 错误: ${errorMessage}\n响应数据: ${JSON.stringify(data)}`)
        message.error(errorMessage)
      }
      
    } catch (error: any) {
      console.error('注册错误:', error)
      setDebugInfo(`网络错误: ${error.message}`)
      message.error('网络错误: ' + error.message)
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
          <h1 style={{ color: '#1890ff', margin: 0 }}>简单错误测试</h1>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>测试错误消息显示</p>
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
            注册测试
          </Button>
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

        {/* 测试说明 */}
        <div style={{ 
          marginTop: 16, 
          padding: 10, 
          background: '#fff7e6', 
          borderRadius: 4,
          fontSize: '12px'
        }}>
          <strong>测试说明:</strong>
          <div>• 输入无效邮箱（如：test）和短密码（如：123）</div>
          <div>• 点击"注册测试"按钮</div>
          <div>• 观察是否显示错误消息</div>
          <div>• 查看调试信息中的详细响应</div>
        </div>
      </Card>
    </div>
  )
}

export default SimpleErrorTest