import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { GitService } from '../services/gitService'
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload'
import * as fs from 'fs'
import * as path from 'path'

const router = express.Router()

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 获取提交历史
router.get('/repositories/:id/commits', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const branch = req.query.branch as string

    const gitService = new GitService(repositoryId, userId)
    const commits = await gitService.getCommits(branch)

    res.json(commits)
  } catch (error) {
    console.error('获取提交历史错误:', error)
    res.status(500).json({ error: '获取提交历史失败' })
  }
})

// 获取分支列表
router.get('/repositories/:id/branches', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id

    const gitService = new GitService(repositoryId, userId)
    const branches = await gitService.getBranches()

    res.json(branches)
  } catch (error) {
    console.error('获取分支列表错误:', error)
    res.status(500).json({ error: '获取分支列表失败' })
  }
})

// 获取文件列表
router.get('/repositories/:id/files', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const path = req.query.path as string || ''

    const gitService = new GitService(repositoryId, userId)
    const files = await gitService.getFiles(path)

    res.json(files)
  } catch (error) {
    console.error('获取文件列表错误:', error)
    res.status(500).json({ error: '获取文件列表失败' })
  }
})

// 获取文件内容
router.get('/repositories/:id/files/content', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const filePath = req.query.path as string

    if (!filePath) {
      return res.status(400).json({ error: '文件路径不能为空' })
    }

    const gitService = new GitService(repositoryId, userId)
    const content = await gitService.getFileContent(filePath)

    res.json({ content })
  } catch (error) {
    console.error('获取文件内容错误:', error)
    res.status(500).json({ error: '获取文件内容失败' })
  }
})

// 创建分支
router.post('/repositories/:id/branches', [
  authenticateToken,
  express.json()
], async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const { branchName, fromBranch } = req.body

    if (!branchName) {
      return res.status(400).json({ error: '分支名称不能为空' })
    }

    const gitService = new GitService(repositoryId, userId)
    const branch = await gitService.createBranch(branchName, fromBranch)

    res.json(branch)
  } catch (error) {
    console.error('创建分支错误:', error)
    res.status(500).json({ error: '创建分支失败' })
  }
})

// 删除分支
router.delete('/repositories/:id/branches/:branchName', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const branchName = req.params.branchName

    const gitService = new GitService(repositoryId, userId)
    await gitService.deleteBranch(branchName)

    res.json({ message: '分支删除成功' })
  } catch (error) {
    console.error('删除分支错误:', error)
    res.status(500).json({ error: '删除分支失败' })
  }
})

// 合并分支
router.post('/repositories/:id/merge', [
  authenticateToken,
  express.json()
], async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const { sourceBranch, targetBranch } = req.body

    if (!sourceBranch || !targetBranch) {
      return res.status(400).json({ error: '源分支和目标分支不能为空' })
    }

    const gitService = new GitService(repositoryId, userId)
    const result = await gitService.mergeBranch(sourceBranch, targetBranch)

    res.json(result)
  } catch (error) {
    console.error('合并分支错误:', error)
    res.status(500).json({ error: '合并分支失败' })
  }
})

// 获取仓库统计信息
router.get('/repositories/:id/stats', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id

    const gitService = new GitService(repositoryId, userId)
    const stats = await gitService.getRepositoryStats()

    res.json(stats)
  } catch (error) {
    console.error('获取仓库统计错误:', error)
    res.status(500).json({ error: '获取仓库统计失败' })
  }
})

// 获取Git状态
router.get('/repositories/:id/status', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id

    const gitService = new GitService(repositoryId, userId)
    const status = await gitService.getStatus()

    res.json(status)
  } catch (error) {
    console.error('获取Git状态错误:', error)
    res.status(500).json({ error: '获取Git状态失败' })
  }
})

// 文件上传 (单个文件)
router.post('/repositories/:id/files/upload', [
  authenticateToken,
  uploadSingle,
  handleUploadError
], async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const targetPath = req.body.path || ''

    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' })
    }

    const gitService = new GitService(repositoryId, userId)
    await gitService.uploadFile(req.file, targetPath)

    // 删除临时文件
    const tempFilePath = path.join(uploadDir, req.file.filename)
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath)
    }

    res.json({ message: '文件上传成功' })
  } catch (error) {
    console.error('文件上传错误:', error)
    res.status(500).json({ error: '文件上传失败' })
  }
})

// 文件上传 (多个文件)
router.post('/repositories/:id/files/upload-multiple', [
  authenticateToken,
  uploadMultiple,
  handleUploadError
], async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const targetPath = req.body.path || ''

    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: '没有上传文件' })
    }

    const gitService = new GitService(repositoryId, userId)
    
    // 上传所有文件
    for (const file of req.files) {
      await gitService.uploadFile(file, targetPath)
      
      // 删除临时文件
      const tempFilePath = path.join(uploadDir, file.filename)
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
      }
    }

    res.json({ message: `成功上传 ${req.files.length} 个文件` })
  } catch (error) {
    console.error('批量文件上传错误:', error)
    res.status(500).json({ error: '文件上传失败' })
  }
})

// 保存文件内容
router.put('/repositories/:id/files/save', [
  authenticateToken,
  express.json()
], async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const { filePath, content } = req.body

    if (!filePath || content === undefined) {
      return res.status(400).json({ error: '文件路径和内容不能为空' })
    }

    const gitService = new GitService(repositoryId, userId)
    await gitService.saveFile(filePath, content)

    res.json({ message: '文件保存成功' })
  } catch (error) {
    console.error('文件保存错误:', error)
    res.status(500).json({ error: '文件保存失败' })
  }
})

// 创建目录
router.post('/repositories/:id/directories', [
  authenticateToken,
  express.json()
], async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const { path: dirPath } = req.body

    if (!dirPath) {
      return res.status(400).json({ error: '目录路径不能为空' })
    }

    const gitService = new GitService(repositoryId, userId)
    await gitService.createDirectory(dirPath)

    res.json({ message: '目录创建成功' })
  } catch (error) {
    console.error('创建目录错误:', error)
    res.status(500).json({ error: '创建目录失败' })
  }
})

// 删除文件
router.delete('/repositories/:id/files/delete', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const filePath = req.query.path as string

    if (!filePath) {
      return res.status(400).json({ error: '文件路径不能为空' })
    }

    const gitService = new GitService(repositoryId, userId)
    await gitService.deleteFile(filePath)

    res.json({ message: '文件删除成功' })
  } catch (error) {
    console.error('删除文件错误:', error)
    res.status(500).json({ error: '删除文件失败' })
  }
})

// 重命名文件
router.put('/repositories/:id/files/rename', [
  authenticateToken,
  express.json()
], async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const { oldPath, newPath } = req.body

    if (!oldPath || !newPath) {
      return res.status(400).json({ error: '原路径和新路径不能为空' })
    }

    const gitService = new GitService(repositoryId, userId)
    await gitService.renameFile(oldPath, newPath)

    res.json({ message: '文件重命名成功' })
  } catch (error) {
    console.error('重命名文件错误:', error)
    res.status(500).json({ error: '重命名文件失败' })
  }
})

// Git add 操作
router.post('/repositories/:id/add', [
  authenticateToken,
  express.json()
], async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const { filePaths } = req.body

    if (!filePaths || !Array.isArray(filePaths)) {
      return res.status(400).json({ error: '文件路径列表不能为空' })
    }

    const gitService = new GitService(repositoryId, userId)
    await gitService.addFiles(filePaths)

    res.json({ message: '文件已添加到暂存区' })
  } catch (error) {
    console.error('Git add错误:', error)
    res.status(500).json({ error: 'Git add失败' })
  }
})

// Git commit 操作
router.post('/repositories/:id/commit', [
  authenticateToken,
  express.json()
], async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ error: '提交消息不能为空' })
    }

    const gitService = new GitService(repositoryId, userId)
    const result = await gitService.commitChanges(message)

    res.json(result)
  } catch (error) {
    console.error('Git commit错误:', error)
    res.status(500).json({ error: 'Git commit失败' })
  }
})

// Git push 操作
router.post('/repositories/:id/push', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositoryId = req.params.id

    const gitService = new GitService(repositoryId, userId)
    const result = await gitService.pushChanges()

    res.json(result)
  } catch (error) {
    console.error('Git push错误:', error)
    res.status(500).json({ error: 'Git push失败' })
  }
})

export default router