import express from 'express'

const router = express.Router()

// Git routes temporarily disabled, will be restored after type issues are fixed
// TODO: Fix type issues and restore full Git operation functionality

router.get('/status', (req, res) => {
  res.json({ status: 'Git routes temporarily disabled' })
})

export default router