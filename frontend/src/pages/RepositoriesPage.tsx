import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Table, 
  Tag, 
  Modal, 
  message,
  Space,
  Popconfirm
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CodeOutlined,
  BranchesOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import { repositoryAPI } from '../services/api'
import type { Repository } from '../types'

const { Title } = Typography
const { TextArea } = Input

interface RepositoryFormData {
  name: string
  description?: string
  url: string
}

const RepositoriesPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRepositories()
  }, [])

  const fetchRepositories = async () => {
    try {
      setLoading(true)
      const response = await repositoryAPI.getRepositories()
      setRepositories(response.data)
    } catch (error) {
      message.error('获取仓库列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: RepositoryFormData) => {
    try {
      setSubmitting(true)
      await repositoryAPI.createRepository(values)
      message.success('仓库创建成功')
      setModalVisible(false)
      form.resetFields()
      fetchRepositories()
    } catch (error: any) {
      message.error(error.response?.data?.error || '创建仓库失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await repositoryAPI.deleteRepository(id)
      message.success('仓库删除成功')
      fetchRepositories()
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除仓库失败')
    }
  }

  const showCreateModal = () => {
    setModalVisible(true)
  }

  const columns = [
    {
      title: '仓库名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Repository) => (
        <Button 
          type="link" 
          onClick={() => window.open(`/repository/${record.id}`, '_blank')}
        >
          <CodeOutlined style={{ marginRight: 4 }} />
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
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (text: string) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: '分支数',
      dataIndex: 'branchCount',
      key: 'branchCount',
      render: (count: number) => (
        <Tag icon={<BranchesOutlined />}>
          {count}
        </Tag>
      ),
    },
    {
      title: '提交数',
      dataIndex: 'commitCount',
      key: 'commitCount',
      render: (count: number) => (
        <Tag icon={<FileTextOutlined />}>
          {count}
        </Tag>
      ),
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
    {
      title: '操作',
      key: 'actions',
      render: (text: any, record: Repository) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => window.open(`/repository/${record.id}`, '_blank')}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要删除这个仓库吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
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

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="仓库管理"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            新建仓库
          </Button>
        }
      >
        <Table
          dataSource={repositories}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: '暂无仓库，点击"新建仓库"创建第一个仓库'
          }}
        />
      </Card>

      {/* 新建仓库模态框 */}
      <Modal
        title="新建仓库"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        okText="创建"
        cancelText="取消"
        confirmLoading={submitting}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            label="仓库名称"
            name="name"
            rules={[
              { required: true, message: '请输入仓库名称' },
              { min: 1, max: 255, message: '仓库名称长度在1-255个字符之间' }
            ]}
          >
            <Input placeholder="请输入仓库名称" />
          </Form.Item>

          <Form.Item
            label="仓库描述"
            name="description"
            rules={[
              { max: 1000, message: '描述长度不能超过1000个字符' }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="请输入仓库描述（可选）" 
            />
          </Form.Item>

          <Form.Item
            label="仓库URL"
            name="url"
            rules={[
              { required: true, message: '请输入仓库URL' },
              { type: 'url', message: '请输入有效的URL' }
            ]}
          >
            <Input placeholder="请输入Git仓库URL，例如：https://github.com/username/repo.git" />
          </Form.Item>

          <div style={{ 
            padding: '12px', 
            background: '#f6f6f6', 
            borderRadius: '6px',
            fontSize: '12px',
            color: '#666'
          }}>
            <strong>提示：</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
              <li>支持GitHub、GitLab、Gitee等Git仓库URL</li>
              <li>仓库URL必须以.git结尾</li>
              <li>创建后系统将自动克隆仓库到本地</li>
            </ul>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default RepositoriesPage