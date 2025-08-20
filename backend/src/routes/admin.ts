import express from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import { User, Repository } from '../models'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// 中间件：检查管理员权限
const requireAdmin = (req: any, res: any, next: any) => {
  // 这里简单检查用户ID为1或4的用户为管理员
  // 在实际应用中，应该有更完善的权限管理系统
  if (req.user.userId !== 1 && req.user.userId !== 4) {
    return res.status(403).json({ error: '需要管理员权限' })
  }
  next()
}

// 获取所有用户
router.get('/users', authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'avatar', 'githubId', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']]
    })
    res.json(users)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({ error: '获取用户列表失败' })
  }
})

// 获取系统统计信息
router.get('/stats', authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const totalUsers = await User.count()
    const activeUsers = await User.count({ where: { isActive: true } })
    const totalRepositories = await Repository.count()
    const totalCommits = await Repository.sum('commitCount') || 0

    res.json({
      totalUsers,
      activeUsers,
      totalRepositories,
      totalCommits
    })
  } catch (error) {
    console.error('获取系统统计失败:', error)
    res.status(500).json({ error: '获取系统统计失败' })
  }
})

// 更新用户信息
router.put('/users/:id', authenticateToken, requireAdmin, [
  body('username').optional().isLength({ min: 3, max: 50 }).withMessage('用户名长度在3-50个字符之间'),
  body('email').optional().isEmail().withMessage('请输入有效的邮箱地址'),
  body('password').optional().isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
  body('isActive').optional().isBoolean().withMessage('状态必须是布尔值')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { username, email, password, isActive } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    const updateData: any = {}
    if (username) updateData.username = username
    if (email) updateData.email = email
    if (password) {
      const saltRounds = 10
      updateData.password = await bcrypt.hash(password, saltRounds)
    }
    if (isActive !== undefined) updateData.isActive = isActive

    await user.update(updateData)

    res.json({
      message: '用户更新成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isActive: user.isActive
      }
    })
  } catch (error) {
    console.error('更新用户失败:', error)
    res.status(500).json({ error: '更新用户失败' })
  }
})

// 删除用户
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 删除用户的所有仓库
    await Repository.destroy({ where: { userId: id } })
    
    // 删除用户
    await user.destroy()

    res.json({ message: '用户删除成功' })
  } catch (error) {
    console.error('删除用户失败:', error)
    res.status(500).json({ error: '删除用户失败' })
  }
})

// 创建新用户
router.post('/users', authenticateToken, requireAdmin, [
  body('username').isLength({ min: 3, max: 50 }).withMessage('用户名长度在3-50个字符之间'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
  body('isActive').optional().isBoolean().withMessage('状态必须是布尔值')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password, isActive = true } = req.body

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ email }, { username }]
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
      password: hashedPassword,
      isActive
    })

    res.status(201).json({
      message: '用户创建成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    })
  } catch (error) {
    console.error('创建用户失败:', error)
    res.status(500).json({ error: '创建用户失败' })
  }
})

// 获取系统设置
router.get('/settings', authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    // 这里应该从数据库或配置文件中获取设置
    // 为了简化，我们返回默认设置
    const settings = {
      userRegistration: true,
      maxRepositoriesPerUser: 10,
      maxFileSize: 10485760, // 10MB
      allowedFileTypes: ['.txt', '.md', '.js', '.ts', '.json', '.yaml', '.yml'],
      maintenanceMode: false
    }

    res.json(settings)
  } catch (error) {
    console.error('获取系统设置失败:', error)
    res.status(500).json({ error: '获取系统设置失败' })
  }
})

// 更新系统设置
router.put('/settings', authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const { userRegistration, maxRepositoriesPerUser, maxFileSize, allowedFileTypes, maintenanceMode } = req.body

    // 验证设置
    if (maxRepositoriesPerUser < 1 || maxRepositoriesPerUser > 100) {
      return res.status(400).json({ error: '最大仓库数量必须在1-100之间' })
    }

    if (maxFileSize < 1 || maxFileSize > 100 * 1024 * 1024) {
      return res.status(400).json({ error: '最大文件大小必须在1-100MB之间' })
    }

    if (!Array.isArray(allowedFileTypes) || allowedFileTypes.length === 0) {
      return res.status(400).json({ error: '必须指定至少一个允许的文件类型' })
    }

    // 这里应该将设置保存到数据库或配置文件中
    // 为了简化，我们只是返回成功消息
    const settings = {
      userRegistration,
      maxRepositoriesPerUser,
      maxFileSize,
      allowedFileTypes,
      maintenanceMode
    }

    res.json({
      message: '系统设置更新成功',
      settings
    })
  } catch (error) {
    console.error('更新系统设置失败:', error)
    res.status(500).json({ error: '更新系统设置失败' })
  }
})

export default router