import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  List, 
  Tag, 
  Progress, 
  message,
  Modal,
  Input,
  Alert
} from 'antd'
import { 
  BranchesOutlined, 
  CommentOutlined, 
  UploadOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import type { GitStatus } from '../types'
import { gitAPI } from '../services/api'

const { Text } = Typography
const { TextArea } = Input

interface GitOperationsPanelProps {
  repositoryId: number
  onRefresh: () => void
}

interface StagedFile {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
}

interface UnstagedFile {
  path: string
  status: 'modified' | 'deleted' | 'untracked'
}

const GitOperationsPanel: React.FC<GitOperationsPanelProps> = ({
  repositoryId,
  onRefresh
}) => {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')
  const [commitModalVisible, setCommitModalVisible] = useState(false)
  const [pushModalVisible, setPushModalVisible] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [committing, setCommitting] = useState(false)

  // 加载Git状态
  const loadGitStatus = async () => {
    try {
      setLoading(true)
      const response = await gitAPI.getStatus(repositoryId)
      setGitStatus(response.data)
    } catch (error) {
      message.error('获取Git状态失败')
    } finally {
      setLoading(false)
    }
  }

  // 解析Git状态文件
  const parseGitStatus = (status: GitStatus) => {
    const staged: StagedFile[] = []
    const unstaged: UnstagedFile[] = []

    status.files.forEach(file => {
      if (file.index !== ' ') {
        // 已暂存的文件
        let stagedStatus: StagedFile['status'] = 'modified'
        if (file.index === 'A') stagedStatus = 'added'
        else if (file.index === 'D') stagedStatus = 'deleted'
        else if (file.index === 'R') stagedStatus = 'renamed'
        
        staged.push({ path: file.path, status: stagedStatus })
      }
      
      if (file.working_dir !== ' ') {
        // 未暂存的文件
        let unstagedStatus: UnstagedFile['status'] = 'modified'
        if (file.working_dir === 'D') unstagedStatus = 'deleted'
        else if (file.working_dir === '??') unstagedStatus = 'untracked'
        
        unstaged.push({ path: file.path, status: unstagedStatus })
      }
    })

    return { staged, unstaged }
  }

  // 添加文件到暂存区
  const handleAddFiles = async (filePaths: string[]) => {
    try {
      await gitAPI.addFiles(repositoryId, filePaths)
      message.success('文件已添加到暂存区')
      loadGitStatus()
    } catch (error) {
      message.error('添加文件失败')
    }
  }

  // 添加所有更改
  const handleAddAll = async () => {
    const status = gitStatus!
    const allFilePaths = status.files.map(f => f.path)
    await handleAddFiles(allFilePaths)
  }

  // 提交更改
  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      message.error('提交消息不能为空')
      return
    }

    try {
      setCommitting(true)
      const response = await gitAPI.commitChanges(repositoryId, commitMessage)
      
      if (response.data.success) {
        message.success('提交成功')
        setCommitModalVisible(false)
        setCommitMessage('')
        loadGitStatus()
        onRefresh()
      } else {
        message.error(response.data.message || '提交失败')
      }
    } catch (error) {
      message.error('提交失败')
    } finally {
      setCommitting(false)
    }
  }

  // 推送更改
  const handlePush = async () => {
    try {
      setPushing(true)
      const response = await gitAPI.pushChanges(repositoryId)
      
      if (response.data.success) {
        message.success('推送成功')
        setPushModalVisible(false)
        loadGitStatus()
        onRefresh()
      } else {
        message.error(response.data.message || '推送失败')
      }
    } catch (error) {
      message.error('推送失败')
    } finally {
      setPushing(false)
    }
  }

  // 文件状态标签
  const getStatusTag = (status: string) => {
    const statusConfig = {
      'added': { color: 'green', text: '新增' },
      'modified': { color: 'orange', text: '修改' },
      'deleted': { color: 'red', text: '删除' },
      'renamed': { color: 'blue', text: '重命名' },
      'untracked': { color: 'purple', text: '未跟踪' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  // 获取Git状态统计
  const getStatusStats = () => {
    if (!gitStatus) return { staged: 0, unstaged: 0, untracked: 0 }
    
    const { staged, unstaged } = parseGitStatus(gitStatus)
    const untracked = unstaged.filter(f => f.status === 'untracked').length
    
    return {
      staged: staged.length,
      unstaged: unstaged.length - untracked,
      untracked
    }
  }

  useEffect(() => {
    loadGitStatus()
  }, [repositoryId])

  const statusStats = getStatusStats()
  const { staged, unstaged } = gitStatus ? parseGitStatus(gitStatus) : { staged: [], unstaged: [] }

  return (
    <div>
      {/* Git状态概览 */}
      <Card title="Git 状态" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              <Text strong>当前分支:</Text>
              <Tag color="blue" icon={<BranchesOutlined />}>
                {gitStatus?.current || '未知'}
              </Tag>
              {gitStatus?.tracking && (
                <Text type="secondary">跟踪: {gitStatus.tracking}</Text>
              )}
            </Space>
            <Button icon={<CommentOutlined />} onClick={loadGitStatus} loading={loading}>
              刷新状态
            </Button>
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Text type="secondary">已暂存:</Text>
              <Progress 
                percent={Math.min((statusStats.staged / 10) * 100, 100)} 
                format={() => statusStats.staged}
                size="small"
                strokeColor="#52c41a"
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text type="secondary">未暂存:</Text>
              <Progress 
                percent={Math.min((statusStats.unstaged / 10) * 100, 100)} 
                format={() => statusStats.unstaged}
                size="small"
                strokeColor="#fa8c16"
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text type="secondary">未跟踪:</Text>
              <Progress 
                percent={Math.min((statusStats.untracked / 10) * 100, 100)} 
                format={() => statusStats.untracked}
                size="small"
                strokeColor="#722ed1"
              />
            </div>
          </div>
        </Space>
      </Card>

      {/* 操作按钮 */}
      <Card title="操作" size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Button 
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => setCommitModalVisible(true)}
            disabled={statusStats.staged === 0}
          >
            提交暂存 ({statusStats.staged})
          </Button>
          
          <Button 
            icon={<PlusOutlined />}
            onClick={handleAddAll}
            disabled={statusStats.staged + statusStats.unstaged + statusStats.untracked === 0}
          >
            添加所有更改
          </Button>
          
          <Button 
            icon={<UploadOutlined />}
            onClick={() => setPushModalVisible(true)}
            disabled={gitStatus?.ahead === 0}
          >
            推送 ({gitStatus?.ahead || 0})
          </Button>
        </Space>
      </Card>

      {/* 已暂存文件 */}
      {staged.length > 0 && (
        <Card title="已暂存文件" size="small" style={{ marginBottom: 16 }}>
          <List
            dataSource={staged}
            renderItem={(file) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  title={file.path}
                  description={getStatusTag(file.status)}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 未暂存文件 */}
      {unstaged.length > 0 && (
        <Card title="未暂存文件" size="small" style={{ marginBottom: 16 }}>
          <List
            dataSource={unstaged}
            renderItem={(file) => (
              <List.Item
                actions={[
                  <Button 
                    key="add"
                    type="link"
                    size="small"
                    onClick={() => handleAddFiles([file.path])}
                  >
                    添加到暂存区
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    file.status === 'untracked' ? 
                      <InfoCircleOutlined style={{ color: '#722ed1' }} /> :
                      <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                  }
                  title={file.path}
                  description={getStatusTag(file.status)}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 提交对话框 */}
      <Modal
        title="提交更改"
        open={commitModalVisible}
        onOk={handleCommit}
        onCancel={() => setCommitModalVisible(false)}
        okText="提交"
        confirmLoading={committing}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message={`准备提交 ${statusStats.staged} 个文件`}
            description="这些文件将被提交到Git仓库"
            type="info"
            showIcon
          />
          
          <div>
            <Text strong>提交消息:</Text>
            <TextArea
              placeholder="请输入提交消息..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              rows={4}
              style={{ marginTop: 8 }}
            />
          </div>
          
          {staged.length > 0 && (
            <div>
              <Text strong>提交的文件:</Text>
              <div style={{ maxHeight: 200, overflow: 'auto', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                {staged.map(file => (
                  <div key={file.path} style={{ padding: '2px 0' }}>
                    {file.path} {getStatusTag(file.status)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Space>
      </Modal>

      {/* 推送对话框 */}
      <Modal
        title="推送到远程仓库"
        open={pushModalVisible}
        onOk={handlePush}
        onCancel={() => setPushModalVisible(false)}
        okText="推送"
        confirmLoading={pushing}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message={`准备推送 ${gitStatus?.ahead || 0} 个提交到远程仓库`}
            description="这些提交将被推送到远程Git仓库"
            type="warning"
            showIcon
          />
          
          <div>
            <Text strong>本地分支:</Text>
            <Tag color="blue">{gitStatus?.current}</Tag>
          </div>
          
          <div>
            <Text strong>远程分支:</Text>
            <Tag color="green">{gitStatus?.tracking}</Tag>
          </div>
          
          <div>
            <Text strong>推送信息:</Text>
            <ul>
              <li>领先: {gitStatus?.ahead || 0} 个提交</li>
              <li>落后: {gitStatus?.behind || 0} 个提交</li>
            </ul>
          </div>
        </Space>
      </Modal>
    </div>
  )
}

export default GitOperationsPanel