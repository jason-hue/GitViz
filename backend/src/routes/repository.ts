import express from 'express'
import { Repository } from '../models'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// 获取用户的所有仓库
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repositories = await Repository.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']]
    })

    res.json(repositories)
  } catch (error) {
    console.error('获取仓库列表错误:', error)
    res.status(500).json({ error: '获取仓库列表失败' })
  }
})

// 创建新仓库 - 简化版本
router.post('/', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const { name, description, url } = req.body

    if (!name || !url) {
      return res.status(400).json({ error: '仓库名称和URL不能为空' })
    }

    const repository = await Repository.create({
      name,
      description,
      url,
      localPath: `/repositories/${userId}/${name}`,
      userId,
      isPrivate: false
    })

    res.status(201).json(repository)
  } catch (error) {
    console.error('创建仓库错误:', error)
    res.status(500).json({ error: '创建仓库失败' })
  }
})

export default router