import React, { useState } from 'react'
import { Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

const DebugTest: React.FC = () => {
  const [loading, setLoading] = useState(false)
  
  const testMessage = () => {
    console.log('测试消息显示...')
    message.info('这是一条测试消息')
    message.success('这是一条成功消息')
    message.warning('这是一条警告消息')
    message.error('这是一条错误消息')
  }
  
  const testAPI = async () => {
    setLoading(true)
    try {
      console.log('测试API调用...')
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'test',
          email: 'invalid-email',
          password: '123'
        })
      })
      
      console.log('响应状态:', response.status)
      const data = await response.json()
      console.log('响应数据:', data)
      
      if (response.ok) {
        message.success('API调用成功')
      } else {
        let errorMessage = '注册失败'
        if (data.errors) {
          errorMessage = data.errors.map(err => err.msg).join(', ')
        }
        console.log('错误消息:', errorMessage)
        message.error(errorMessage)
      }
      
    } catch (error) {
      console.error('API错误:', error)
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
      <Card style={{ width: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ color: '#1890ff', margin: 0 }}>调试测试</h1>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>测试消息显示和API调用</p>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="default" 
            onClick={testMessage}
            style={{ width: '100%', marginBottom: 8 }}
          >
            测试消息显示
          </Button>
          
          <Button 
            type="primary" 
            loading={loading}
            onClick={testAPI}
            style={{ width: '100%' }}
          >
            测试API调用
          </Button>
        </div>

        <div style={{ 
          marginTop: 20, 
          padding: 10, 
          background: '#fff7e6', 
          borderRadius: 4,
          fontSize: '12px'
        }}>
          <strong>测试说明:</strong>
          <div>• 点击"测试消息显示"检查消息组件是否正常</div>
          <div>• 点击"测试API调用"检查错误处理</div>
          <div>• 打开浏览器控制台查看详细日志</div>
        </div>
      </Card>
    </div>
  )
}

export default DebugTest