import React, { useEffect, useState } from 'react'
import { Layout, Menu, Card, Row, Col, Statistic, Button, Table, Tag } from 'antd'
import { 
  DashboardOutlined, 
  CodeOutlined, 
  TeamOutlined, 
  SettingOutlined,
  PlusOutlined,
  BranchesOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import { repositoryAPI } from '../services/api'
import type { Repository } from '../types'

const { Header, Sider, Content } = Layout

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMenuKey, setSelectedMenuKey] = useState('dashboard')

  useEffect(() => {
    fetchRepositories()
  }, [])

  const fetchRepositories = async () => {
    try {
      const response = await repositoryAPI.getRepositories()
      setRepositories(response.data)
    } catch (error) {
      console.error('获取仓库列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleMenuClick = (key: string) => {
    setSelectedMenuKey(key)
    switch (key) {
      case 'dashboard':
        // 当前页面，无需导航
        break
      case 'repositories':
        navigate('/repositories')
        break
      case 'branches':
        navigate('/branches')
        break
      case 'commits':
        navigate('/commits')
        break
      case 'team':
        navigate('/team')
        break
      case 'settings':
        navigate('/settings')
        break
      case 'admin':
        navigate('/admin')
        break
      default:
        break
    }
  }

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: '仪表板' },
    { key: 'repositories', icon: <CodeOutlined />, label: '仓库管理' },
    { key: 'branches', icon: <BranchesOutlined />, label: '分支管理' },
    { key: 'commits', icon: <FileTextOutlined />, label: '提交历史' },
    { key: 'team', icon: <TeamOutlined />, label: '团队协作' },
    { key: 'settings', icon: <SettingOutlined />, label: '设置' },
    ...(user?.id === 1 || user?.id === 4 ? [{ key: 'admin', icon: <SettingOutlined />, label: '管理员' }] : []),
  ]

  const repositoryColumns = [
    {
      title: '仓库名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Repository) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/repository/${record.id}`)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: '分支数',
      dataIndex: 'branchCount',
      key: 'branchCount',
    },
    {
      title: '提交数',
      dataIndex: 'commitCount',
      key: 'commitCount',
    },
    {
      title: '状态',
      dataIndex: 'isPrivate',
      key: 'isPrivate',
      render: (isPrivate: boolean) => (
        <Tag color={isPrivate ? 'red' : 'green'}>
          {isPrivate ? '私有' : '公开'}
        </Tag>
      ),
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#1890ff', margin: 0 }}>GitViz</h1>
          <div>
            <span style={{ marginRight: 16 }}>欢迎, {user?.username}</span>
            <Button onClick={handleLogout}>退出登录</Button>
          </div>
        </div>
      </Header>
      
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedMenuKey]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
          />
        </Sider>
        
        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <div style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic title="总仓库数" value={repositories.length} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="总提交数" value={repositories.reduce((sum, repo) => sum + repo.commitCount, 0)} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="总分支数" value={repositories.reduce((sum, repo) => sum + repo.branchCount, 0)} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="活跃仓库" value={repositories.filter(repo => new Date(repo.lastUpdated) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} />
                </Card>
              </Col>
            </Row>
          </div>

          <Card 
            title="我的仓库" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/repositories')}
              >
                新建仓库
              </Button>
            }
          >
            <Table
              dataSource={repositories}
              columns={repositoryColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  )
}

export default DashboardPage