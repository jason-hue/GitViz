import cors from 'cors'
import dotenv from 'dotenv'
import { detectFrontendPort } from '../utils/portDetector'
import fs from 'fs'
import path from 'path'

dotenv.config()

const BACKEND_PORT_FILE = path.join(__dirname, '../../backend-port.json')

/**
 * 获取当前后端端口
 */
const getCurrentBackendPort = (): number => {
  try {
    if (fs.existsSync(BACKEND_PORT_FILE)) {
      const portData = JSON.parse(fs.readFileSync(BACKEND_PORT_FILE, 'utf8'))
      return portData.backendPort || 8000
    }
  } catch (error) {
    console.log('⚠️ 读取后端端口文件失败')
  }
  return 8000
}

/**
 * 动态获取允许的前端域名列表
 */
const getAllowedOrigins = async (): Promise<string[]> => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    // 获取当前后端端口，用于计算可能的前端端口
    const backendPort = getCurrentBackendPort()
    const frontendPort = backendPort - 5000
    
    // 基础开发域名
    const baseOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:3003',
      'http://127.0.0.1:3004',
      'http://127.0.0.1:3005'
    ]
    
    // 添加基于当前后端端口计算的前端端口
    const calculatedOrigin = `http://localhost:${frontendPort}`
    const calculatedOrigin127 = `http://127.0.0.1:${frontendPort}`
    
    if (!baseOrigins.includes(calculatedOrigin)) {
      baseOrigins.push(calculatedOrigin)
    }
    if (!baseOrigins.includes(calculatedOrigin127)) {
      baseOrigins.push(calculatedOrigin127)
    }
    
    try {
      // 动态检测前端端口
      const detectedPort = await detectFrontendPort()
      const dynamicOrigin = `http://localhost:${detectedPort}`
      const dynamicOrigin127 = `http://127.0.0.1:${detectedPort}`
      
      // 如果检测到的端口不在基础列表中，添加进去
      if (!baseOrigins.includes(dynamicOrigin)) {
        baseOrigins.push(dynamicOrigin)
      }
      if (!baseOrigins.includes(dynamicOrigin127)) {
        baseOrigins.push(dynamicOrigin127)
      }
      
      console.log(`🎯 动态CORS配置:`)
      console.log(`   后端端口: ${backendPort}`)
      console.log(`   计算前端端口: ${frontendPort}`)
      console.log(`   检测前端端口: ${detectedPort}`)
      console.log(`   允许的域名: ${[dynamicOrigin, dynamicOrigin127, calculatedOrigin, calculatedOrigin127].join(', ')}`)
    } catch (error) {
      console.log('⚠️ 端口检测失败，使用基础配置')
    }
    
    // 从环境变量添加额外的开发域名
    if (process.env.DEV_FRONTEND_URLS) {
      const additionalUrls = process.env.DEV_FRONTEND_URLS.split(',').map(url => url.trim())
      baseOrigins.push(...additionalUrls)
    }
    
    return baseOrigins
  }
  
  // 生产环境：从环境变量获取允许的域名
  return process.env.PROD_FRONTEND_URLS 
    ? process.env.PROD_FRONTEND_URLS.split(',').map(url => url.trim())
    : []
}

/**
 * CORS配置函数
 * 根据环境动态配置CORS策略
 */
export const configureCors = async () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  // 获取允许的域名列表
  const allowedOrigins = await getAllowedOrigins()
  
  // 开发环境：允许本地开发端口
  if (isDevelopment) {
    return {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // 允许没有 origin 的请求（比如移动端app、Postman等）
        if (!origin) return callback(null, true)
        
        // 允许所有列出的域名
        if (allowedOrigins.includes(origin)) {
          return callback(null, true)
        }
        
        // 开发环境下，允许任何 localhost 端口
        if (origin.match(/^http:\/\/localhost:\d+$/) || origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
          console.log(`🔓 允许动态开发域名: ${origin}`)
          return callback(null, true)
        }
        
        console.warn(`🚫 CORS阻止域名: ${origin}`)
        callback(new Error(`Not allowed by CORS: ${origin}`))
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
      exposedHeaders: ['Content-Length', 'X-Knowledge-Base'],
      maxAge: 86400 // 24小时
    }
  }
  
  // 生产环境：只允许指定域名
  if (isProduction) {
    const productionOrigins = process.env.PROD_FRONTEND_URLS 
      ? process.env.PROD_FRONTEND_URLS.split(',').map(url => url.trim())
      : []
    
    // 确保至少有一个生产域名
    if (productionOrigins.length === 0) {
      console.warn('No production frontend URLs configured, CORS will be restrictive')
    }
    
    return {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) return callback(null, true)
        
        if (productionOrigins.includes(origin)) {
          return callback(null, true)
        }
        
        console.warn(`CORS blocked origin in production: ${origin}`)
        callback(new Error(`Not allowed by CORS: ${origin}`))
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
      exposedHeaders: ['Content-Length', 'X-Knowledge-Base'],
      maxAge: 86400
    }
  }
  
  // 默认配置（测试环境等）
  return {
    origin: true, // 允许所有来源（仅用于测试）
    credentials: true
  }
}

/**
 * 同步版本的CORS配置（用于兼容性）
 */
export const configureCorsSync = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  // 开发环境：允许本地开发端口
  if (isDevelopment) {
    // 获取当前后端端口，用于计算可能的前端端口
    const backendPort = getCurrentBackendPort()
    const frontendPort = backendPort - 5000
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:3003',
      'http://127.0.0.1:3004',
      'http://127.0.0.1:3005'
    ]
    
    // 添加基于当前后端端口计算的前端端口
    const calculatedOrigin = `http://localhost:${frontendPort}`
    const calculatedOrigin127 = `http://127.0.0.1:${frontendPort}`
    
    if (!allowedOrigins.includes(calculatedOrigin)) {
      allowedOrigins.push(calculatedOrigin)
    }
    if (!allowedOrigins.includes(calculatedOrigin127)) {
      allowedOrigins.push(calculatedOrigin127)
    }
    
    // 从环境变量添加额外的开发域名
    if (process.env.DEV_FRONTEND_URLS) {
      const additionalUrls = process.env.DEV_FRONTEND_URLS.split(',').map(url => url.trim())
      allowedOrigins.push(...additionalUrls)
    }
    
    console.log(`🎯 同步CORS配置:`)
    console.log(`   后端端口: ${backendPort}`)
    console.log(`   计算前端端口: ${frontendPort}`)
    console.log(`   允许的域名: ${[calculatedOrigin, calculatedOrigin127].join(', ')}`)
    
    return {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // 允许没有 origin 的请求（比如移动端app、Postman等）
        if (!origin) return callback(null, true)
        
        // 允许所有列出的域名
        if (allowedOrigins.includes(origin)) {
          return callback(null, true)
        }
        
        // 开发环境下，允许任何 localhost 端口
        if (origin.match(/^http:\/\/localhost:\d+$/) || origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
          console.log(`🔓 允许动态开发域名: ${origin}`)
          return callback(null, true)
        }
        
        console.warn(`🚫 CORS阻止域名: ${origin}`)
        callback(new Error(`Not allowed by CORS: ${origin}`))
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
      exposedHeaders: ['Content-Length', 'X-Knowledge-Base'],
      maxAge: 86400 // 24小时
    }
  }
  
  // 生产环境：只允许指定域名
  if (isProduction) {
    const productionOrigins = process.env.PROD_FRONTEND_URLS 
      ? process.env.PROD_FRONTEND_URLS.split(',').map(url => url.trim())
      : []
    
    // 确保至少有一个生产域名
    if (productionOrigins.length === 0) {
      console.warn('No production frontend URLs configured, CORS will be restrictive')
    }
    
    return {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) return callback(null, true)
        
        if (productionOrigins.includes(origin)) {
          return callback(null, true)
        }
        
        console.warn(`CORS blocked origin in production: ${origin}`)
        callback(new Error(`Not allowed by CORS: ${origin}`))
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
      exposedHeaders: ['Content-Length', 'X-Knowledge-Base'],
      maxAge: 86400
    }
  }
  
  // 默认配置（测试环境等）
  return {
    origin: true, // 允许所有来源（仅用于测试）
    credentials: true
  }
}

/**
 * 验证CORS配置
 */
export const validateCorsConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (isProduction && !process.env.PROD_FRONTEND_URLS) {
    console.warn('⚠️  Production environment detected but no PROD_FRONTEND_URLS configured')
    console.warn('   Please set PROD_FRONTEND_URLS in your .env file')
  }
  
  if (isDevelopment) {
    console.log('🔧 Development CORS configuration loaded')
    console.log('   Allowing localhost:* and configured development URLs')
  }
}

// 导出默认配置
export default configureCorsSync