import { Request, Response, NextFunction } from 'express'

/**
 * CORS调试中间件
 * 记录CORS相关的请求信息，帮助调试跨域问题
 */
export const corsDebugMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    const origin = req.headers.origin
    const method = req.method
    const path = req.path
    
    // 记录预检请求
    if (method === 'OPTIONS') {
      console.log(`🔍 CORS Preflight Request: ${origin || 'No Origin'} -> ${method} ${path}`)
      console.log(`   Request Headers:`, req.headers)
    }
    
    // 记录实际请求
    if (origin && method !== 'OPTIONS') {
      console.log(`🌐 CORS Request: ${origin} -> ${method} ${path}`)
    }
    
    // 监控响应头
    const originalSetHeader = res.setHeader
    res.setHeader = function(name: string, value: string | string[]) {
      if (name.toLowerCase().includes('access-control')) {
        console.log(`📋 CORS Response Header: ${name} = ${value}`)
      }
      return originalSetHeader.call(this, name, value)
    }
  }
  
  next()
}

/**
 * CORS错误处理中间件
 * 捕获和处理CORS相关错误
 */
export const corsErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.message && err.message.includes('CORS')) {
    console.error(`🚫 CORS Error: ${err.message}`)
    console.error(`   Origin: ${req.headers.origin}`)
    console.error(`   Method: ${req.method}`)
    console.error(`   Path: ${req.path}`)
    
    // 在开发环境下返回详细的错误信息
    if (process.env.NODE_ENV === 'development') {
      res.status(403).json({
        error: 'CORS Policy Violation',
        message: err.message,
        origin: req.headers.origin,
        method: req.method,
        path: req.path,
        solution: 'Please check your frontend URL configuration or contact the administrator'
      })
    } else {
      // 生产环境下返回简单的错误信息
      res.status(403).json({
        error: 'Access Denied',
        message: 'Cross-origin request not allowed'
      })
    }
    return
  }
  
  next(err)
}

export default corsDebugMiddleware