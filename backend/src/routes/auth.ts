import express from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { Op } from 'sequelize'
import { User } from '../models'

const router = express.Router()

// 用户注册
router.post('/register', [
  body('username').isLength({ min: 3, max: 50 }).withMessage('用户名长度必须在3-50个字符之间'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password } = req.body

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    })

    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已存在' })
    }

    // 加密密码
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    })

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as any
    )

    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      },
      token
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ error: '注册失败' })
  }
})

// 用户登录
router.post('/login', [
  body('username').notEmpty().withMessage('请输入用户名'),
  body('password').notEmpty().withMessage('请输入密码')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, password } = req.body

    // 查找用户
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: username }, { username }]
      }
    })

    if (!user || !user.password) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as any
    )

    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      },
      token
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ error: '登录失败' })
  }
})

// GitHub登录
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }))

// GitHub回调
router.get('/github/callback', passport.authenticate('github', { session: false }), (req: any, res: any) => {
  const user = req.user as any
  
  // 生成JWT令牌
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as any
  )

  // 重定向到前端，带上token
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}&user=${encodeURIComponent(JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar
  }))}`)
})

// 获取当前用户信息
router.get('/me', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'username', 'email', 'avatar', 'createdAt']
    })

    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json(user)
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(401).json({ error: '无效的认证令牌' })
  }
})

// 用户登出
router.post('/logout', (req: any, res: any) => {
  res.json({ message: '登出成功' })
})

export default router