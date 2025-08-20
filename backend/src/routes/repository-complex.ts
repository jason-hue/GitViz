import express from 'express'
import { body, validationResult } from 'express-validator'
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

// 获取单个仓库详情
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repository = await Repository.findOne({
      where: { id: req.params.id, userId }
    })

    if (!repository) {
      return res.status(404).json({ error: '仓库不存在' })
    }

    res.json(repository)
  } catch (error) {
    console.error('获取仓库详情错误:', error)
    res.status(500).json({ error: '获取仓库详情失败' })
  }
})

// 创建新仓库
router.post('/', [
  authenticateToken,
  body('name').isLength({ min: 1, max: 255 }).withMessage('仓库名称长度必须在1-255个字符之间'),
  body('url').isURL().withMessage('请输入有效的仓库URL')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const userId = req.user.userId
    const { name, description, url } = req.body

    // 生成本地路径
    const localPath = `/repositories/${userId}/${name}`

    const repository = await Repository.create({
      name,
      description,
      url,
      localPath,
      userId,
      isPrivate: false
    })

    res.status(201).json(repository)
  } catch (error) {
    console.error('创建仓库错误:', error)
    res.status(500).json({ error: '创建仓库失败' })
  }
})

// 更新仓库
router.put('/:id', [
  authenticateToken,
  body('name').optional().isLength({ min: 1, max: 255 }).withMessage('仓库名称长度必须在1-255个字符之间'),
  body('url').optional().isURL().withMessage('请输入有效的仓库URL')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const userId = req.user.userId
    const { name, description, url, isPrivate } = req.body

    const repository = await Repository.findOne({
      where: { id: req.params.id, userId }
    })

    if (!repository) {
      return res.status(404).json({ error: '仓库不存在' })
    }

    await repository.update({
      name: name || repository.name,
      description: description || repository.description,
      url: url || repository.url,
      isPrivate: isPrivate !== undefined ? isPrivate : repository.isPrivate
    })

    res.json(repository)
  } catch (error) {
    console.error('更新仓库错误:', error)
    res.status(500).json({ error: '更新仓库失败' })
  }
})

// 删除仓库
router.delete('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const repository = await Repository.findOne({
      where: { id: req.params.id, userId }
    })

    if (!repository) {
      return res.status(404).json({ error: '仓库不存在' })
    }

    await repository.destroy()

    res.json({ message: '仓库删除成功' })
  } catch (error) {
    console.error('删除仓库错误:', error)
    res.status(500).json({ error: '删除仓库失败' })
  }
})

// 克隆仓库
router.post('/clone', [
  authenticateToken,
  body('url').isURL().withMessage('请输入有效的仓库URL')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const userId = req.user.userId
    const { url } = req.body

    // 从URL中提取仓库名称
    const urlParts = url.split('/')
    const name = urlParts[urlParts.length - 1].replace('.git', '')

    // 生成本地路径
    const localPath = `/repositories/${userId}/${name}`

    const repository = await Repository.create({
      name,
      url,
      localPath,
      userId,
      isPrivate: false
    })

    res.status(201).json(repository)
  } catch (error) {
    console.error('克隆仓库错误:', error)
    res.status(500).json({ error: '克隆仓库失败' })
  }
})

export default router