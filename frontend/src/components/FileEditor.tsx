import React, { useState, useEffect, useCallback } from 'react'
import { 
  Modal, 
  Button, 
  Space, 
  Typography, 
  message, 
  Spin, 
  Dropdown, 
  Menu,
  Tag
} from 'antd'
import { 
  SaveOutlined, 
  ReloadOutlined,
  FileTextOutlined,
  EditOutlined
} from '@ant-design/icons'
import Editor from '@monaco-editor/react'
import type { FileItem } from '../types'
import { gitAPI } from '../services/api'

const { Text } = Typography

interface FileEditorProps {
  repositoryId: number
  file: FileItem | null
  visible: boolean
  onClose: () => void
  onSave: () => void
}

const FileEditor: React.FC<FileEditorProps> = ({
  repositoryId,
  file,
  visible,
  onClose,
  onSave
}) => {
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [language, setLanguage] = useState('plaintext')

  // 根据文件扩展名设置语言
  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'sh': 'shell',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'sql': 'sql',
      'dockerfile': 'dockerfile',
      'gitignore': 'ignore'
    }
    return languageMap[ext || ''] || 'plaintext'
  }

  // 加载文件内容
  const loadFileContent = useCallback(async () => {
    if (!file) return

    try {
      setLoading(true)
      const response = await gitAPI.getFileContent(repositoryId, file.path)
      const fileContent = response.data
      setContent(fileContent)
      setOriginalContent(fileContent)
      setHasUnsavedChanges(false)
      setLanguage(getLanguageFromFilename(file.name))
    } catch (error) {
      message.error('加载文件内容失败')
      setContent('')
    } finally {
      setLoading(false)
    }
  }, [file, repositoryId])

  // 保存文件
  const handleSave = async () => {
    if (!file) return

    try {
      setSaving(true)
      await gitAPI.saveFile(repositoryId, file.path, content)
      setOriginalContent(content)
      setHasUnsavedChanges(false)
      message.success('文件保存成功')
      onSave()
    } catch (error) {
      message.error('文件保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 关闭编辑器
  const handleClose = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '确认关闭',
        content: '您有未保存的更改，确定要关闭吗？',
        okText: '关闭',
        cancelText: '取消',
        onOk: onClose
      })
    } else {
      onClose()
    }
  }

  // 重新加载
  const handleReload = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '确认重新加载',
        content: '重新加载将丢失当前未保存的更改，确定要继续吗？',
        okText: '重新加载',
        cancelText: '取消',
        onOk: loadFileContent
      })
    } else {
      loadFileContent()
    }
  }

  // 编辑器配置
  const editorOptions = {
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on' as const,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    lineNumbers: 'on' as const,
    folding: true,
    renderWhitespace: 'boundary' as const
  }

  // 右键菜单
  const getEditorMenu = () => (
    <Menu>
      <Menu.Item key="save" icon={<SaveOutlined />} onClick={handleSave}>
        保存
      </Menu.Item>
      <Menu.Item key="reload" icon={<ReloadOutlined />} onClick={handleReload}>
        重新加载
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="copy" onClick={() => navigator.clipboard.writeText(content)}>
        复制全部
      </Menu.Item>
      <Menu.Item key="paste" onClick={async () => {
        const text = await navigator.clipboard.readText()
        setContent(text)
      }}>
        粘贴
      </Menu.Item>
    </Menu>
  )

  // 检查是否有未保存的更改
  useEffect(() => {
    setHasUnsavedChanges(content !== originalContent)
  }, [content, originalContent])

  // 当文件变化时重新加载内容
  useEffect(() => {
    if (visible && file) {
      loadFileContent()
    } else {
      setContent('')
      setOriginalContent('')
      setHasUnsavedChanges(false)
    }
  }, [visible, file, loadFileContent])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return

      // Ctrl+S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }

      // Ctrl+W 关闭
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visible, handleSave, handleClose])

  if (!file) return null

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <Text>编辑文件: {file.name}</Text>
          {hasUnsavedChanges && (
            <Tag color="orange">未保存</Tag>
          )}
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={handleReload}>
          重新加载
        </Button>,
        <Button key="cancel" onClick={handleClose}>
          关闭
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
          disabled={!hasUnsavedChanges}
        >
          保存
        </Button>
      ]}
      width={1200}
      height={800}
      style={{ top: 20 }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
        {/* 工具栏 */}
        <div style={{ 
          padding: '8px 16px', 
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Space>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              路径: {file.path}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              大小: {file.size ? `${(file.size / 1024).toFixed(2)} KB` : '未知'}
            </Text>
            <Tag color="blue">{language}</Tag>
          </Space>
          
          <Dropdown overlay={getEditorMenu()} trigger={['click']}>
            <Button type="text" icon={<EditOutlined />}>
              编辑
            </Button>
          </Dropdown>
        </div>

        {/* 编辑器 */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%' 
            }}>
              <Spin size="large" />
            </div>
          ) : (
            <Editor
              height="100%"
              language={language}
              value={content}
              onChange={(value) => setContent(value || '')}
              options={editorOptions}
              theme="vs-light"
            />
          )}
        </div>

        {/* 状态栏 */}
        <div style={{ 
          padding: '4px 16px', 
          borderTop: '1px solid #f0f0f0',
          background: '#fafafa',
          fontSize: '12px',
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            {content.split('\n').length} 行, {content.length} 字符
          </span>
          <span>
            {hasUnsavedChanges ? '有未保存的更改' : '已保存'}
          </span>
        </div>
      </div>
    </Modal>
  )
}

export default FileEditor