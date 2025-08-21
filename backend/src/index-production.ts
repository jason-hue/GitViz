import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { connectDatabase } from './config/database'
import { setupPassport } from './config/passport'
import configureCors from './config/cors'
import authRoutes from './routes/auth'
import repositoryRoutes from './routes/repository'
import gitRoutes from './routes/git'
import adminRoutes from './routes/admin'

dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT || '8000')

// 速率限制配置
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: '请求过于频繁，请稍后再试'
})

// 中间件
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))
app.use(morgan('combined'))
app.use(limiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/repositories', repositoryRoutes)
app.use('/api/git', gitRoutes)
app.use('/api/admin', adminRoutes)

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '路由不存在' })
})

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: '服务器内部错误' })
})

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await connectDatabase()
    
    // 设置Passport
    setupPassport()
    
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`)
      console.log(`📊 健康检查: http://localhost:${PORT}/health`)
      console.log(`🔗 API地址: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('❌ 服务器启动失败:', error)
    process.exit(1)
  }
}

startServer()