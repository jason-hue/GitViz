import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Typography, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Switch, 
  Select, 
  message, 
  Popconfirm,
  Statistic,
  Row,
  Col,
  Tabs,
  Alert
} from 'antd'
import { 
  UserOutlined, 
  SettingOutlined, 
  DatabaseOutlined,
  SecurityScanOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { adminAPI } from '../services/api'
import type { User } from '../types'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalRepositories: number
  totalCommits: number
}

interface SystemSettings {
  userRegistration: boolean
  maxRepositoriesPerUser: number
  maxFileSize: number
  allowedFileTypes: string[]
  maintenanceMode: boolean
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRepositories: 0,
    totalCommits: 0
  })
  const [settings, setSettings] = useState<SystemSettings>({
    userRegistration: true,
    maxRepositoriesPerUser: 10,
    maxFileSize: 10485760,
    allowedFileTypes: ['.txt', '.md', '.js', '.ts', '.json', '.yaml', '.yml'],
    maintenanceMode: false
  })
  const [loading, setLoading] = useState(true)
  const [userModalVisible, setUserModalVisible] = useState(false)
  const [settingsModalVisible, setSettingsModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [form] = Form.useForm()
  const [settingsForm] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersResponse, statsResponse] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getSystemStats()
      ])
      setUsers(usersResponse.data)
      setStats(statsResponse.data)
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUserEdit = (user: User) => {
    setSelectedUser(user)
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      isActive: user.isActive
    })
    setUserModalVisible(true)
  }

  const handleUserUpdate = async (values: any) => {
    if (!selectedUser) return

    try {
      await adminAPI.updateUser(selectedUser.id, values)
      message.success('用户更新成功')
      setUserModalVisible(false)
      setSelectedUser(null)
      form.resetFields()
      fetchData()
    } catch (error) {
      message.error('更新用户失败')
    }
  }

  const handleUserDelete = async (userId: number) => {
    try {
      await adminAPI.deleteUser(userId)
      message.success('用户删除成功')
      fetchData()
    } catch (error) {
      message.error('删除用户失败')
    }
  }

  const handleUserToggleActive = async (userId: number, isActive: boolean) => {
    try {
      await adminAPI.updateUser(userId, { isActive })
      message.success(`用户已${isActive ? '启用' : '禁用'}`)
      fetchData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleSettingsUpdate = async (values: SystemSettings) => {
    try {
      await adminAPI.updateSystemSettings(values)
      message.success('系统设置更新成功')
      setSettingsModalVisible(false)
      setSettings(values)
    } catch (error) {
      message.error('更新设置失败')
    }
  }

  const userColumns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => `#${id}`
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (username: string, record: User) => (
        <Space>
          <UserOutlined />
          {username}
          {record.avatar && (
            <img 
              src={record.avatar} 
              alt={username} 
              style={{ width: 24, height: 24, borderRadius: '50%' }}
            />
          )}
        </Space>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'GitHub',
      dataIndex: 'githubId',
      key: 'githubId',
      render: (githubId: string) => (
        <Tag color={githubId ? 'green' : 'default'}>
          {githubId ? '已绑定' : '未绑定'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: User) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleUserToggleActive(record.id, checked)}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      )
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'actions',
      render: (text: any, record: User) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleUserEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？这将同时删除该用户的所有数据。"
            onConfirm={() => handleUserDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okType="danger"
          >
            <Button 
              type="link" 
              icon={<DeleteOutlined />}
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'overview',
      label: '系统概览',
      icon: <DatabaseOutlined />,
      children: (
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总用户数"
                value={stats.totalUsers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃用户"
                value={stats.activeUsers}
                prefix={<CheckOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="仓库总数"
                value={stats.totalRepositories}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="提交总数"
                value={stats.totalCommits}
                prefix={<SecurityScanOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'users',
      label: '用户管理',
      icon: <UserOutlined />,
      children: (
        <Card
          title="用户列表"
          extra={
            <Button 
              type="primary" 
              icon={<UserOutlined />}
              onClick={() => {
                setSelectedUser(null)
                form.resetFields()
                setUserModalVisible(true)
              }}
            >
              新建用户
            </Button>
          }
        >
          <Table
            dataSource={users}
            columns={userColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: 'settings',
      label: '系统设置',
      icon: <SettingOutlined />,
      children: (
        <Card
          title="系统配置"
          extra={
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => {
                settingsForm.setFieldsValue(settings)
                setSettingsModalVisible(true)
              }}
            >
              编辑设置
            </Button>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message="系统状态"
              description={
                <Space>
                  <span>维护模式:</span>
                  <Tag color={settings.maintenanceMode ? 'red' : 'green'}>
                    {settings.maintenanceMode ? '开启' : '关闭'}
                  </Tag>
                  <span>用户注册:</span>
                  <Tag color={settings.userRegistration ? 'green' : 'red'}>
                    {settings.userRegistration ? '开启' : '关闭'}
                  </Tag>
                </Space>
              }
              type="info"
              showIcon
            />

            <div>
              <h4>仓库限制</h4>
              <p>每个用户最多创建 {settings.maxRepositoriesPerUser} 个仓库</p>
            </div>

            <div>
              <h4>文件上传限制</h4>
              <p>最大文件大小: {(settings.maxFileSize / 1024 / 1024).toFixed(2)} MB</p>
              <p>允许的文件类型: {settings.allowedFileTypes.join(', ')}</p>
            </div>
          </Space>
        </Card>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SettingOutlined style={{ marginRight: 8 }} />
          管理员控制台
        </Title>
      </div>

      <Tabs items={tabItems} />

      {/* 用户编辑模态框 */}
      <Modal
        title={selectedUser ? '编辑用户' : '新建用户'}
        open={userModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setUserModalVisible(false)
          setSelectedUser(null)
          form.resetFields()
        }}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUserUpdate}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 50, message: '用户名长度在3-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          {!selectedUser && (
            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度至少6个字符' }
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            label="状态"
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 系统设置模态框 */}
      <Modal
        title="系统设置"
        open={settingsModalVisible}
        onOk={() => settingsForm.submit()}
        onCancel={() => setSettingsModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form
          form={settingsForm}
          layout="vertical"
          onFinish={handleSettingsUpdate}
          initialValues={settings}
        >
          <Form.Item
            label="用户注册"
            name="userRegistration"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="维护模式"
            name="maintenanceMode"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="每个用户最大仓库数量"
            name="maxRepositoriesPerUser"
            rules={[
              { required: true, message: '请输入最大仓库数量' },
              { type: 'number', min: 1, max: 100, message: '仓库数量在1-100之间' }
            ]}
          >
            <Input type="number" min={1} max={100} />
          </Form.Item>

          <Form.Item
            label="最大文件大小 (MB)"
            name="maxFileSize"
            rules={[
              { required: true, message: '请输入最大文件大小' },
              { type: 'number', min: 1, max: 100, message: '文件大小在1-100MB之间' }
            ]}
          >
            <Input type="number" min={1} max={100} />
          </Form.Item>

          <Form.Item
            label="允许的文件类型"
            name="allowedFileTypes"
            rules={[
              { required: true, message: '请选择允许的文件类型' }
            ]}
          >
            <Select 
              mode="tags" 
              placeholder="请选择或输入文件类型"
              style={{ width: '100%' }}
            >
              <Option value=".txt">.txt</Option>
              <Option value=".md">.md</Option>
              <Option value=".js">.js</Option>
              <Option value=".ts">.ts</Option>
              <Option value=".json">.json</Option>
              <Option value=".yaml">.yaml</Option>
              <Option value=".yml">.yml</Option>
              <Option value=".html">.html</Option>
              <Option value=".css">.css</Option>
              <Option value=".py">.py</Option>
              <Option value=".java">.java</Option>
              <Option value=".cpp">.cpp</Option>
              <Option value=".go">.go</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminPage