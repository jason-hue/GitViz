import React, { useState, useEffect } from 'react'
import { 
  Layout, 
  Row, 
  Col, 
  Card, 
  Typography, 
  Breadcrumb, 
  Tag,
  Spin,
  Alert,
  Space
} from 'antd'
import { 
  HomeOutlined, 
  BranchesOutlined, 
  CommentOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import { repositoryAPI } from '../services/api'
import type { Repository, FileItem } from '../types'
import FileBrowser from '../components/FileBrowser'
import FileUploader from '../components/FileUploader'
import FileEditor from '../components/FileEditor'
import GitOperationsPanel from '../components/GitOperationsPanel'

const { Content } = Layout
const { Title, Text } = Typography

const RepositoryDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [repository, setRepository] = useState<Repository | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPath] = useState('')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [fileEditorVisible, setFileEditorVisible] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // 加载仓库信息
  const loadRepository = async () => {
    if (!id) return

    try {
      setLoading(true)
      const response = await repositoryAPI.getRepository(id)
      setRepository(response.data)
    } catch (error) {
      console.error('加载仓库失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 刷新页面数据
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    loadRepository()
  }

  // 处理文件选择
  const handleFileSelect = (file: FileItem) => {
    if (file.type === 'file') {
      setSelectedFile(file)
      setFileEditorVisible(true)
    }
  }

  // 处理文件上传成功
  const handleUploadSuccess = () => {
    handleRefresh()
  }

  // 处理文件保存成功
  const handleFileSave = () => {
    handleRefresh()
  }

  // 返回仪表板
  const handleBack = () => {
    navigate('/dashboard')
  }

  useEffect(() => {
    loadRepository()
  }, [id, refreshKey])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!repository) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message="仓库不存在" type="error" />
      </div>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '0 24px' }}>
        {/* 顶部导航 */}
        <div style={{ 
          background: '#fff', 
          padding: '16px 24px', 
          margin: '24px 0', 
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <HomeOutlined />
                  <span onClick={handleBack} style={{ cursor: 'pointer' }}>
                    仪表板
                  </span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{repository.name}</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
            <Col>
              <Text type="secondary" style={{ marginRight: 16 }}>
                欢迎, {user?.username}
              </Text>
            </Col>
          </Row>
          
          <Row align="middle" style={{ marginTop: 16 }}>
            <Col flex="auto">
              <Title level={3} style={{ margin: 0 }}>
                <BranchesOutlined style={{ marginRight: 8 }} />
                {repository.name}
              </Title>
              <Text type="secondary" style={{ marginLeft: 32 }}>
                {repository.description || '暂无描述'}
              </Text>
            </Col>
            <Col>
              <Space>
                <Tag color={repository.isPrivate ? 'red' : 'green'}>
                  {repository.isPrivate ? '私有' : '公开'}
                </Tag>
                <Tag icon={<CommentOutlined />}>
                  {repository.commitCount} 提交
                </Tag>
                <Tag icon={<BranchesOutlined />}>
                  {repository.branchCount} 分支
                </Tag>
              </Space>
            </Col>
          </Row>
        </div>

        {/* 主要内容 */}
        <Row gutter={16}>
          {/* 左侧文件浏览器 */}
          <Col span={6}>
            <Card 
              title="文件浏览器" 
              size="small"
              style={{ height: 'calc(100vh - 200px)' }}
              bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
            >
              <FileBrowser
                repositoryId={repository.id}
                currentPath={currentPath}
                onFileSelect={handleFileSelect}
                onFileUpload={() => setUploadModalVisible(true)}
                onRefresh={handleRefresh}
              />
            </Card>
          </Col>

          {/* 右侧内容区域 */}
          <Col span={18}>
            {/* Git操作面板 */}
            <GitOperationsPanel
              repositoryId={repository.id}
              onRefresh={handleRefresh}
            />
          </Col>
        </Row>
      </Content>

      {/* 文件上传模态框 */}
      <FileUploader
        repositoryId={repository.id}
        currentPath={currentPath}
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* 文件编辑器模态框 */}
      <FileEditor
        repositoryId={repository.id}
        file={selectedFile}
        visible={fileEditorVisible}
        onClose={() => {
          setFileEditorVisible(false)
          setSelectedFile(null)
        }}
        onSave={handleFileSave}
      />
    </Layout>
  )
}

export default RepositoryDetailPage