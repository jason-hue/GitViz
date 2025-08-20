import React, { useState, useCallback } from 'react'
import { 
  Modal, 
  Button, 
  Progress, 
  List, 
  Typography, 
  Space, 
  message,
  Tag,
  Divider
} from 'antd'
import { 
  InboxOutlined, 
  FileOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { useDropzone } from 'react-dropzone'
import { gitAPI } from '../services/api'

const { Text } = Typography

interface FileUploadProps {
  repositoryId: number
  currentPath: string
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

interface UploadFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  repositoryId,
  currentPath,
  visible,
  onClose,
  onSuccess
}) => {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // 处理文件拖拽
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: false
  })

  
  // 删除文件
  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  // 清空文件列表
  const handleClearAll = () => {
    setFiles([])
  }

  // 上传文件
  const handleUpload = async () => {
    if (files.length === 0) {
      message.warning('请先选择要上传的文件')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const pendingFiles = files.filter(f => f.status === 'pending')
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < pendingFiles.length; i++) {
      const uploadFile = pendingFiles[i]
      
      // 更新状态为上传中
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ))

      try {
        // 模拟上传进度
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f.id === uploadFile.id && f.status === 'uploading') {
              const newProgress = Math.min(f.progress + Math.random() * 30, 90)
              return { ...f, progress: newProgress }
            }
            return f
          }))
        }, 200)

        // 实际上传
        await gitAPI.uploadFile(repositoryId, uploadFile.file, {
          path: currentPath
        })

        clearInterval(progressInterval)

        // 更新状态为成功
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'success', progress: 100 }
            : f
        ))

        successCount++
      } catch (error: any) {
        // 更新状态为失败
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                status: 'error', 
                progress: 0, 
                error: error.response?.data?.error || error.message 
              }
            : f
        ))

        failCount++
      }

      // 更新总体进度
      const overallProgress = ((i + 1) / pendingFiles.length) * 100
      setUploadProgress(overallProgress)
    }

    setIsUploading(false)

    if (successCount > 0) {
      message.success(`成功上传 ${successCount} 个文件`)
    }
    
    if (failCount > 0) {
      message.error(`有 ${failCount} 个文件上传失败`)
    }

    // 如果全部成功，关闭对话框
    if (failCount === 0) {
      setTimeout(() => {
        onClose()
        onSuccess()
        setFiles([])
        setUploadProgress(0)
      }, 1500)
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 获取文件状态标签
  const getStatusTag = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <Tag color="default">等待上传</Tag>
      case 'uploading':
        return <Tag color="processing">上传中</Tag>
      case 'success':
        return <Tag color="success" icon={<CheckCircleOutlined />}>上传成功</Tag>
      case 'error':
        return <Tag color="error" icon={<CloseCircleOutlined />}>上传失败</Tag>
      default:
        return null
    }
  }

  return (
    <Modal
      title="上传文件"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="clear" onClick={handleClearAll} disabled={isUploading}>
          清空
        </Button>,
        <Button key="cancel" onClick={onClose} disabled={isUploading}>
          取消
        </Button>,
        <Button 
          key="upload" 
          type="primary" 
          onClick={handleUpload}
          loading={isUploading}
          disabled={files.length === 0}
        >
          上传 ({files.length})
        </Button>
      ]}
      width={800}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">当前路径: {currentPath || '/'}</Text>
      </div>

      {/* 拖拽区域 */}
      <div 
        {...getRootProps()}
        style={{
          border: '2px dashed #d9d9d9',
          borderRadius: 8,
          padding: '20px',
          textAlign: 'center',
          backgroundColor: isDragActive ? '#fafafa' : '#fff',
          cursor: 'pointer',
          marginBottom: 16
        }}
      >
        <input {...getInputProps()} />
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
        </p>
        <p className="ant-upload-text">
          {isDragActive ? '松开以上传文件' : '点击或拖拽文件到此区域上传'}
        </p>
        <p className="ant-upload-hint">
          支持单个或批量上传。严禁上传公司数据或其他被禁止的文件。
        </p>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <>
          <Divider />
          <List
            dataSource={files}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    key="remove"
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveFile(item.id)}
                    disabled={isUploading}
                    danger
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={<FileOutlined />}
                  title={
                    <Space>
                      <Text>{item.file.name}</Text>
                      {getStatusTag(item.status)}
                    </Space>
                  }
                  description={
                    <Space>
                      <Text type="secondary">{formatFileSize(item.file.size)}</Text>
                      {item.error && (
                        <Text type="danger">{item.error}</Text>
                      )}
                    </Space>
                  }
                />
                {item.status === 'uploading' && (
                  <Progress 
                    percent={Math.round(item.progress)} 
                    size="small" 
                    style={{ width: 100 }}
                  />
                )}
              </List.Item>
            )}
          />
        </>
      )}

      {/* 总体进度 */}
      {isUploading && (
        <>
          <Divider />
          <div>
            <Text strong>总体进度:</Text>
            <Progress 
              percent={Math.round(uploadProgress)} 
              style={{ marginTop: 8 }}
            />
          </div>
        </>
      )}
    </Modal>
  )
}

export default FileUpload