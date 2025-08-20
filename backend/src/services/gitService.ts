import { Repository } from '../models'
import { simpleGit, SimpleGit } from 'simple-git'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

export interface Commit {
  hash: string
  message: string
  author: string
  email: string
  date: string
  changes: {
    additions: number
    deletions: number
    files: number
  }
}

export interface Branch {
  name: string
  isCurrent: boolean
  commit: string
  commitCount: number
}

export interface FileItem {
  path: string
  name: string
  type: 'file' | 'directory'
  size?: number
  lastModified: string
}

export interface GitStatus {
  branch: string
  ahead: number
  behind: number
  current: string
  tracking: string
  files: {
    path: string
    index: string
    working_dir: string
  }[]
}

export interface CommitResult {
  success: boolean
  message: string
  commit?: string
  error?: string
}

export interface PushResult {
  success: boolean
  message: string
  pushed?: boolean
  error?: string
}

export class GitService {
  private repositoryId: string
  private userId: number
  private git: SimpleGit
  private repositoryPath: string

  constructor(repositoryId: string, userId: number) {
    this.repositoryId = repositoryId
    this.userId = userId
    this.repositoryPath = path.join(process.cwd(), 'repositories', userId.toString(), repositoryId)
    this.git = simpleGit(this.repositoryPath)
  }

  async initializeRepository(): Promise<void> {
    try {
      // 获取仓库信息
      const repository = await Repository.findOne({
        where: { id: this.repositoryId, userId: this.userId }
      })

      if (!repository) {
        throw new Error('仓库不存在')
      }

      // 创建目录
      if (!fs.existsSync(this.repositoryPath)) {
        fs.mkdirSync(this.repositoryPath, { recursive: true })
      }

      // 检查是否已经是Git仓库
      const isGitRepo = await this.git.checkIsRepo()
      
      if (!isGitRepo) {
        // 克隆仓库
        await this.git.clone(repository.url, this.repositoryPath)
      } else {
        // 拉取最新代码
        await this.git.pull()
      }

    } catch (error) {
      console.error('初始化仓库失败:', error)
      throw error
    }
  }

  async getCommits(branch?: string): Promise<Commit[]> {
    try {
      await this.initializeRepository()
      
      const logOptions = branch ? [branch] : []
      const logs = await this.git.log(logOptions)
      
      return logs.all.map(commit => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        email: commit.author_email,
        date: commit.date,
        changes: {
          additions: 0, // 需要通过其他方式获取
          deletions: 0,
          files: 0
        }
      }))
    } catch (error) {
      console.error('获取提交历史失败:', error)
      throw error
    }
  }

  async getBranches(): Promise<Branch[]> {
    try {
      await this.initializeRepository()
      
      const branches = await this.git.branchLocal()
      const currentBranch = branches.current
      
      return Object.keys(branches.branches).map(branchName => {
        const branch = branches.branches[branchName]
        return {
          name: branchName,
          isCurrent: branchName === currentBranch,
          commit: branch.commit,
          commitCount: 0 // 需要通过其他方式计算
        }
      })
    } catch (error) {
      console.error('获取分支列表失败:', error)
      throw error
    }
  }

  async getFiles(filePath: string = ''): Promise<FileItem[]> {
    try {
      await this.initializeRepository()
      
      const fullPath = path.join(this.repositoryPath, filePath)
      const items = fs.readdirSync(fullPath)
      
      const files: FileItem[] = []
      
      for (const item of items) {
        const itemPath = path.join(fullPath, item)
        const stats = fs.statSync(itemPath)
        
        files.push({
          path: path.join(filePath, item),
          name: item,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          lastModified: stats.mtime.toISOString()
        })
      }
      
      return files
    } catch (error) {
      console.error('获取文件列表失败:', error)
      throw error
    }
  }

  async getFileContent(filePath: string): Promise<string> {
    try {
      await this.initializeRepository()
      
      const fullPath = path.join(this.repositoryPath, filePath)
      const content = fs.readFileSync(fullPath, 'utf-8')
      
      return content
    } catch (error) {
      console.error('获取文件内容失败:', error)
      throw error
    }
  }

  async createBranch(branchName: string, fromBranch?: string): Promise<Branch> {
    try {
      await this.initializeRepository()
      
      if (fromBranch) {
        await this.git.checkout(fromBranch)
      }
      
      await this.git.checkoutLocalBranch(branchName)
      
      return {
        name: branchName,
        isCurrent: true,
        commit: '',
        commitCount: 0
      }
    } catch (error) {
      console.error('创建分支失败:', error)
      throw error
    }
  }

  async deleteBranch(branchName: string): Promise<void> {
    try {
      await this.initializeRepository()
      
      // 不能删除当前分支
      const currentBranch = await this.git.revparse(['--abbrev-ref', 'HEAD'])
      if (currentBranch === branchName) {
        throw new Error('不能删除当前分支')
      }
      
      await this.git.deleteLocalBranch(branchName)
    } catch (error) {
      console.error('删除分支失败:', error)
      throw error
    }
  }

  async mergeBranch(sourceBranch: string, targetBranch: string): Promise<any> {
    try {
      await this.initializeRepository()
      
      // 切换到目标分支
      await this.git.checkout(targetBranch)
      
      // 合并源分支
      const mergeResult = await this.git.merge([sourceBranch])
      
      return {
        success: true,
        message: '合并成功',
        conflicts: mergeResult.conflicts || []
      }
    } catch (error) {
      console.error('合并分支失败:', error)
      throw error
    }
  }

  async getRepositoryStats(): Promise<any> {
    try {
      await this.initializeRepository()
      
      const [commits, branches] = await Promise.all([
        this.getCommits(),
        this.getBranches()
      ])
      
      return {
        totalCommits: commits.length,
        totalBranches: branches.length,
        activeBranches: branches.filter(b => b.isCurrent).length,
        latestCommit: commits[0] || null,
        contributors: [] // 需要通过其他方式计算
      }
    } catch (error) {
      console.error('获取仓库统计失败:', error)
      throw error
    }
  }

  async uploadFile(file: Express.Multer.File, targetPath: string): Promise<void> {
    try {
      await this.initializeRepository()
      
      const fullPath = path.join(this.repositoryPath, targetPath, file.originalname)
      const dirPath = path.dirname(fullPath)
      
      // 确保目录存在
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
      
      // 保存文件
      fs.writeFileSync(fullPath, file.buffer)
      
    } catch (error) {
      console.error('文件上传失败:', error)
      throw error
    }
  }

  async saveFile(filePath: string, content: string): Promise<void> {
    try {
      await this.initializeRepository()
      
      const fullPath = path.join(this.repositoryPath, filePath)
      const dirPath = path.dirname(fullPath)
      
      // 确保目录存在
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
      
      // 保存文件内容
      fs.writeFileSync(fullPath, content, 'utf-8')
      
    } catch (error) {
      console.error('文件保存失败:', error)
      throw error
    }
  }

  async getStatus(): Promise<GitStatus> {
    try {
      await this.initializeRepository()
      
      const status = await this.git.status()
      
      return {
        branch: status.current || '',
        ahead: status.ahead || 0,
        behind: status.behind || 0,
        current: status.current || '',
        tracking: status.tracking || '',
        files: status.files.map(file => ({
          path: file.path,
          index: file.index,
          working_dir: file.working_dir
        }))
      }
    } catch (error) {
      console.error('获取Git状态失败:', error)
      throw error
    }
  }

  async addFiles(filePaths: string[]): Promise<void> {
    try {
      await this.initializeRepository()
      
      // 添加文件到暂存区
      await this.git.add(filePaths)
      
    } catch (error) {
      console.error('Git add失败:', error)
      throw error
    }
  }

  async commitChanges(message: string): Promise<CommitResult> {
    try {
      await this.initializeRepository()
      
      // 检查是否有暂存的更改
      const status = await this.git.status()
      if (status.staged.length === 0) {
        return {
          success: false,
          message: '没有暂存的更改',
          error: 'No staged changes'
        }
      }
      
      // 提交更改
      const commit = await this.git.commit(message)
      
      return {
        success: true,
        message: '提交成功',
        commit: (commit as any).commit?.hash || ''
      }
    } catch (error) {
      console.error('Git commit失败:', error)
      return {
        success: false,
        message: '提交失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async pushChanges(): Promise<PushResult> {
    try {
      await this.initializeRepository()
      
      // 检查是否配置了远程仓库
      const remotes = await this.git.getRemotes()
      if (remotes.length === 0) {
        return {
          success: false,
          message: '没有配置远程仓库',
          error: 'No remote repository configured'
        }
      }
      
      // 推送更改
      const pushResult = await this.git.push()
      
      return {
        success: true,
        message: '推送成功',
        pushed: true
      }
    } catch (error) {
      console.error('Git push失败:', error)
      return {
        success: false,
        message: '推送失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      await this.initializeRepository()
      
      const fullPath = path.join(this.repositoryPath, dirPath)
      
      // 创建目录
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
      }
      
    } catch (error) {
      console.error('创建目录失败:', error)
      throw error
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.initializeRepository()
      
      const fullPath = path.join(this.repositoryPath, filePath)
      
      // 删除文件
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
      }
      
    } catch (error) {
      console.error('删除文件失败:', error)
      throw error
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      await this.initializeRepository()
      
      const fullOldPath = path.join(this.repositoryPath, oldPath)
      const fullNewPath = path.join(this.repositoryPath, newPath)
      
      // 确保新目录存在
      const newDirPath = path.dirname(fullNewPath)
      if (!fs.existsSync(newDirPath)) {
        fs.mkdirSync(newDirPath, { recursive: true })
      }
      
      // 重命名文件
      fs.renameSync(fullOldPath, fullNewPath)
      
    } catch (error) {
      console.error('重命名文件失败:', error)
      throw error
    }
  }
}