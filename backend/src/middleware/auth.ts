import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number
    username: string
  }
}

export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    }
    next()
  } catch (error) {
    return res.status(403).json({ error: '无效的认证令牌' })
  }
}

export { AuthenticatedRequest }