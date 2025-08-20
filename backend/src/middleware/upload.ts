import multer from 'multer'
import path from 'path'
import { Request } from 'express'

// 配置存储
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // 临时存储目录，稍后会被GitService移动到正确位置
    cb(null, path.join(process.cwd(), 'uploads'))
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // 使用时间戳和随机数生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

// 文件过滤器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 允许的文件类型
  const allowedTypes = [
    'text/plain',
    'application/json',
    'application/javascript',
    'application/typescript',
    'text/html',
    'text/css',
    'text/markdown',
    'application/xml',
    'text/xml',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed'
  ]

  // 允许的文件扩展名
  const allowedExtensions = [
    '.txt', '.json', '.js', '.ts', '.jsx', '.tsx',
    '.html', '.css', '.md', '.xml', '.svg', '.pdf',
    '.zip', '.tar', '.gz', '.jpg', '.jpeg', '.png', '.gif'
  ]

  const fileExtension = path.extname(file.originalname).toLowerCase()
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true)
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`))
  }
}

// 配置上传中间件
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10 // 最多10个文件
  }
})

// 单个文件上传中间件
export const uploadSingle = upload.single('file')

// 多个文件上传中间件
export const uploadMultiple = upload.array('files', 10)

// 错误处理中间件
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小超过限制 (最大10MB)' })
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: '文件数量超过限制 (最多10个)' })
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: '意外的文件字段' })
    }
  }
  
  if (error.message.includes('不支持的文件类型')) {
    return res.status(400).json({ error: error.message })
  }
  
  next(error)
}