export interface User {
  id: number
  username: string
  email: string
  avatar?: string
}

export interface Repository {
  id: number
  name: string
  description?: string
  url: string
  localPath: string
  isPrivate: boolean
  lastUpdated: string
  branchCount: number
  commitCount: number
}

export interface Commit {
  id: string
  message: string
  author: string
  email: string
  timestamp: string
  changes: {
    additions: number
    deletions: number
    files: number
  }
}

export interface Branch {
  name: string
  isCurrent: boolean
  commitCount: number
  lastCommit: string
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

export interface FileUploadOptions {
  path?: string
  overwrite?: boolean
}

export interface FileOperationResult {
  success: boolean
  message: string
  error?: string
}