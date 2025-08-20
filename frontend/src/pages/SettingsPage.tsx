import React from 'react'
import { Card, Typography, Form, Input, Button, Switch, Divider } from 'antd'

const { Title } = Typography

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm()

  const handleSave = (values: any) => {
    console.log('保存设置:', values)
    // TODO: 实现保存设置的逻辑
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>设置</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            notifications: true,
            darkMode: false,
            autoSync: true
          }}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[{ required: true, message: '请输入邮箱' }]}
          >
            <Input type="email" />
          </Form.Item>

          <Divider />

          <Form.Item
            label="启用通知"
            name="notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="深色模式"
            name="darkMode"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="自动同步"
            name="autoSync"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default SettingsPage