import React, { useState, useEffect } from 'react'
import { 
  Tree, 
  Button, 
  Space, 
  Typography, 
  Modal, 
  Input, 
  message, 
  Dropdown, 
  Menu,
  Tooltip
} from 'antd'
import {
  FolderOutlined,
  FileOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FolderAddOutlined,
  FileAddOutlined
} from '@ant-design/icons'
import type { FileItem } from '../types'
import { gitAPI } from '../services/api'

const { Text } = Typography

interface FileBrowserProps {
  repositoryId: number
  currentPath: string
  onFileSelect: (file: FileItem) => void
  onFileUpload: () => void
  onRefresh: () => void
}

interface TreeNode {
  key: string
  title: React.ReactNode
  isLeaf?: boolean
  icon?: React.ReactNode
  children?: TreeNode[]
  data: FileItem
}

const FileBrowser: React.FC<FileBrowserProps> = ({
  repositoryId,
  currentPath,
  onFileSelect,
  onFileUpload,
  onRefresh
}) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [createType, setCreateType] = useState<'file' | 'directory'>('file')
  const [createName, setCreateName] = useState('')
  const [createPath, setCreatePath] = useState('')

  // 加载文件树
  const loadFileTree = async (path: string = '') => {
    try {
      setLoading(true)
      const response = await gitAPI.getFiles(repositoryId, path)
      const files = response.data
      
      const treeNodes: TreeNode[] = files.map(file => ({
        title: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{file.name}</span>
            {file.type === 'file' && file.size && (
              <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                {formatFileSize(file.size)}
              </Text>
            )}
          </div>
        ),
        key: file.path,
        isLeaf: file.type === 'file',
        icon: file.type === 'directory' ? <FolderOutlined /> : <FileOutlined />,
        data: file
      }))
      
      if (path === '') {
        setTreeData(treeNodes)
      }
      
      return treeNodes
    } catch {
      message.error('加载文件列表失败')
      return []
    } finally {
      setLoading(false)
    }
  }

  // 加载子节点
  const onLoadData = ({ key, children }: { key: string; children?: TreeNode[] }) => {
    return new Promise<void>(async (resolve) => {
      if (children) {
        resolve()
        return
      }
      
      const childNodes = await loadFileTree(key)
      const updateTreeData = (data: TreeNode[], key: string, children: TreeNode[]): TreeNode[] => {
        return data.map(node => {
          if (node.key === key) {
            return { ...node, children }
          }
          if (node.children) {
            return { ...node, children: updateTreeData(node.children, key, children) }
          }
          return node
        })
      }
      
      setTreeData(origin => updateTreeData(origin, key, childNodes))
      resolve()
    })
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 处理文件选择
  const handleSelect = (keys: React.Key[], info: { node: TreeNode }) => {
    setSelectedKeys(keys as string[])
    if (info.node.isLeaf) {
      onFileSelect(info.node.data)
    }
  }

  // 处理展开
  const handleExpand = (keys: React.Key[]) => {
    setExpandedKeys(keys as string[])
  }

  // 刷新文件列表
  const handleRefresh = () => {
    setTreeData([])
    setExpandedKeys([])
    setSelectedKeys([])
    loadFileTree()
    onRefresh()
  }

  // 创建文件/目录
  const handleCreate = async () => {
    if (!createName.trim()) {
      message.error('名称不能为空')
      return
    }
    
    try {
      if (createType === 'directory') {
        await gitAPI.createDirectory(repositoryId, `${createPath}/${createName}`.replace(/^\//, ''))
        message.success('目录创建成功')
      } else {
        // 创建空文件
        await gitAPI.saveFile(repositoryId, `${createPath}/${createName}`.replace(/^\//, ''), '')
        message.success('文件创建成功')
      }
      
      setCreateModalVisible(false)
      setCreateName('')
      handleRefresh()
    } catch {
      message.error('创建失败')
    }
  }

  // 显示创建对话框
  const showCreateModal = (type: 'file' | 'directory') => {
    setCreateType(type)
    setCreatePath(currentPath)
    setCreateModalVisible(true)
  }

  // 右键菜单
  const getContextMenu = (node: TreeNode) => (
    <Menu>
      {node.data.type === 'directory' && (
        <Menu.Item key="createFile" icon={<FileAddOutlined />} onClick={() => {
          setCreatePath(node.data.path)
          showCreateModal('file')
        }}>
          新建文件
        </Menu.Item>
      )}
      {node.data.type === 'directory' && (
        <Menu.Item key="createDir" icon={<FolderAddOutlined />} onClick={() => {
          setCreatePath(node.data.path)
          showCreateModal('directory')
        }}>
          新建目录
        </Menu.Item>
      )}
      {node.data.type === 'file' && (
        <Menu.Item key="rename" icon={<EditOutlined />}>
          重命名
        </Menu.Item>
      )}
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
        删除
      </Menu.Item>
    </Menu>
  )

  useEffect(() => {
    loadFileTree()
  }, [repositoryId])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
        <Space>
          <Tooltip title="刷新">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            />
          </Tooltip>
          <Tooltip title="新建文件">
            <Button 
              icon={<FileAddOutlined />} 
              onClick={() => showCreateModal('file')}
            />
          </Tooltip>
          <Tooltip title="新建目录">
            <Button 
              icon={<FolderAddOutlined />} 
              onClick={() => showCreateModal('directory')}
            />
          </Tooltip>
          <Tooltip title="上传文件">
            <Button 
              type="primary"
              icon={<UploadOutlined />} 
              onClick={onFileUpload}
            />
          </Tooltip>
        </Space>
      </div>

      {/* 文件树 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Tree
          showIcon
          treeData={treeData}
          onSelect={handleSelect}
          onExpand={handleExpand}
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
          loadData={onLoadData}
          height={600}
          blockNode
          titleRender={(node: TreeNode) => (
            <Dropdown overlay={getContextMenu(node)} trigger={['contextMenu']}>
              <div style={{ width: '100%' }}>{node.title}</div>
            </Dropdown>
          )}
        />
      </div>

      {/* 创建文件/目录对话框 */}
      <Modal
        title={`创建${createType === 'file' ? '文件' : '目录'}`}
        open={createModalVisible}
        onOk={handleCreate}
        onCancel={() => setCreateModalVisible(false)}
        okText="创建"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>路径: {createPath}</Text>
          <Input
            placeholder={`请输入${createType === 'file' ? '文件' : '目录'}名称`}
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            onPressEnter={handleCreate}
          />
        </Space>
      </Modal>
    </div>
  )
}

export default FileBrowser