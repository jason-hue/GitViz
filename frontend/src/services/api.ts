import axios from 'axios'
import type { 
  User, 
  Repository, 
  Commit, 
  Branch, 
  FileItem, 
  GitStatus, 
  CommitResult, 
  PushResult, 
  FileUploadOptions, 
  FileOperationResult 
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 只在非登录页面处理401错误，避免登录错误时页面刷新
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 认证相关API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post<{ user: User; token: string }>('/auth/login', credentials),
  
  register: (userData: { 
    username: string; 
    email: string; 
    password: string;
    isAdmin?: boolean;
    adminCode?: string;
  }) =>
    api.post<{ user: User; token: string }>('/auth/register', userData),
  
  logout: () => api.post('/auth/logout'),
  
  getCurrentUser: () => api.get<User>('/auth/me'),
  
  githubLogin: () => api.get('/auth/github'),
  
  githubCallback: (code: string) => api.post<{ user: User; token: string }>('/auth/github/callback', { code }),
}

// 仓库相关API
export const repositoryAPI = {
  getRepositories: () => api.get<Repository[]>('/repositories'),
  
  getRepository: (id: string) => api.get<Repository>(`/repositories/${id}`),
  
  createRepository: (data: { name: string; description?: string; url: string }) =>
    api.post<Repository>('/repositories', data),
  
  updateRepository: (id: string, data: Partial<Repository>) =>
    api.put<Repository>(`/repositories/${id}`, data),
  
  deleteRepository: (id: string) => api.delete(`/repositories/${id}`),
  
  cloneRepository: (url: string) => api.post<Repository>('/repositories/clone', { url }),
}

// 管理员相关API
export const adminAPI = {
  // 用户管理
  getUsers: () => api.get<User[]>('/admin/users'),
  
  getUser: (id: number) => api.get<User>(`/admin/users/${id}`),
  
  createUser: (userData: { username: string; email: string; password: string; isActive?: boolean }) =>
    api.post<User>('/admin/users', userData),
  
  updateUser: (id: number, userData: { username?: string; email?: string; password?: string; isActive?: boolean }) =>
    api.put<User>(`/admin/users/${id}`, userData),
  
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  
  // 系统统计
  getSystemStats: () => api.get<{
    totalUsers: number
    activeUsers: number
    totalRepositories: number
    totalCommits: number
  }>('/admin/stats'),
  
  // 系统设置
  getSystemSettings: () => api.get<{
    userRegistration: boolean
    maxRepositoriesPerUser: number
    maxFileSize: number
    allowedFileTypes: string[]
    maintenanceMode: boolean
  }>('/admin/settings'),
  
  updateSystemSettings: (settings: {
    userRegistration?: boolean
    maxRepositoriesPerUser?: number
    maxFileSize?: number
    allowedFileTypes?: string[]
    maintenanceMode?: boolean
  }) => api.put('/admin/settings', settings),
}

// Git操作相关API
export const gitAPI = {
  getCommits: (repositoryId: string, branch?: string) =>
    api.get<Commit[]>(`/repositories/${repositoryId}/commits`, { params: { branch } }),
  
  getBranches: (repositoryId: string) =>
    api.get<Branch[]>(`/repositories/${repositoryId}/branches`),
  
  getFiles: (repositoryId: string, path: string = '') =>
    api.get<FileItem[]>(`/repositories/${repositoryId}/files`, { params: { path } }),
  
  getFileContent: (repositoryId: string, path: string) =>
    api.get<string>(`/repositories/${repositoryId}/files/${path}`),
  
  getStatus: (repositoryId: string) =>
    api.get<GitStatus>(`/repositories/${repositoryId}/status`),
  
  createBranch: (repositoryId: string, branchName: string, fromBranch?: string) =>
    api.post<Branch>(`/repositories/${repositoryId}/branches`, { branchName, fromBranch }),
  
  deleteBranch: (repositoryId: string, branchName: string) =>
    api.delete(`/repositories/${repositoryId}/branches/${branchName}`),
  
  mergeBranch: (repositoryId: string, sourceBranch: string, targetBranch: string) =>
    api.post(`/repositories/${repositoryId}/merge`, { sourceBranch, targetBranch }),
  
  // 文件操作相关
  uploadFile: (repositoryId: string, file: File, options?: FileUploadOptions) => {
    const formData = new FormData()
    formData.append('file', file)
    if (options?.path) {
      formData.append('path', options.path)
    }
    
    return api.post<FileOperationResult>(`/repositories/${repositoryId}/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  uploadMultipleFiles: (repositoryId: string, files: File[], options?: FileUploadOptions) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    if (options?.path) {
      formData.append('path', options.path)
    }
    
    return api.post<FileOperationResult>(`/repositories/${repositoryId}/files/upload-multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  saveFile: (repositoryId: string, filePath: string, content: string) =>
    api.put<FileOperationResult>(`/repositories/${repositoryId}/files/${filePath}`, { content }),
  
  createDirectory: (repositoryId: string, dirPath: string) =>
    api.post<FileOperationResult>(`/repositories/${repositoryId}/directories`, { path: dirPath }),
  
  deleteFile: (repositoryId: string, filePath: string) =>
    api.delete<FileOperationResult>(`/repositories/${repositoryId}/files/${filePath}`),
  
  renameFile: (repositoryId: string, oldPath: string, newPath: string) =>
    api.put<FileOperationResult>(`/repositories/${repositoryId}/files/rename`, { oldPath, newPath }),
  
  // Git操作相关
  addFiles: (repositoryId: string, filePaths: string[]) =>
    api.post<FileOperationResult>(`/repositories/${repositoryId}/add`, { filePaths }),
  
  commitChanges: (repositoryId: string, message: string) =>
    api.post<CommitResult>(`/repositories/${repositoryId}/commit`, { message }),
  
  pushChanges: (repositoryId: string) =>
    api.post<PushResult>(`/repositories/${repositoryId}/push`),
}

export default api