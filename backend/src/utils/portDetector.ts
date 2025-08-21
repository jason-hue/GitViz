import net from 'net'
import fs from 'fs'
import path from 'path'

/**
 * 端口检测工具
 * 用于检测前端端口并同步到后端
 */

const PORT_SYNC_FILE = path.join(__dirname, '../../frontend-port.json')

/**
 * 检测前端运行的端口
 * @param startPort 起始端口
 * @param endPort 结束端口
 * @returns 检测到的端口或默认端口
 */
export const detectFrontendPort = async (
  startPort: number = 3000,
  endPort: number = 3005
): Promise<number> => {
  // 首先检查端口同步文件
  try {
    if (fs.existsSync(PORT_SYNC_FILE)) {
      const portData = JSON.parse(fs.readFileSync(PORT_SYNC_FILE, 'utf8'))
      const syncedPort = portData.port
      
      // 验证同步的端口是否真的有前端服务运行
      if (await isPortInUse(syncedPort)) {
        console.log(`🔗 使用同步的前端端口: ${syncedPort}`)
        return syncedPort
      }
    }
  } catch (error) {
    console.log('⚠️ 读取端口同步文件失败，开始端口检测')
  }

  // 扫描端口范围，查找运行中的前端服务
  console.log(`🔍 扫描前端端口 ${startPort}-${endPort}...`)
  
  for (let port = startPort; port <= endPort; port++) {
    if (await isPortInUse(port)) {
      console.log(`✅ 检测到前端运行在端口: ${port}`)
      
      // 保存端口信息
      savePortSync(port)
      return port
    }
  }

  console.log(`⚠️ 未检测到运行中的前端服务，使用默认端口: ${startPort}`)
  return startPort
}

/**
 * 检查端口是否被占用
 * @param port 端口号
 * @returns 是否被占用
 */
export const isPortInUse = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer()
    
    server.listen(port, () => {
      server.close(() => {
        resolve(false) // 端口可用，未被占用
      })
    })

    server.on('error', () => {
      resolve(true) // 端口被占用
    })
  })
}

/**
 * 保存端口同步信息
 * @param port 前端端口
 */
export const savePortSync = (port: number): void => {
  try {
    const portData = {
      port,
      timestamp: new Date().toISOString(),
      detected: true
    }
    
    fs.writeFileSync(PORT_SYNC_FILE, JSON.stringify(portData, null, 2))
    console.log(`💾 端口同步信息已保存: ${port}`)
  } catch (error) {
    console.error('❌ 保存端口同步信息失败:', error)
  }
}

/**
 * 监控前端端口变化
 * @param callback 端口变化回调
 * @param checkInterval 检查间隔（毫秒）
 */
export const monitorFrontendPort = (
  callback: (port: number) => void,
  checkInterval: number = 5000
): NodeJS.Timeout => {
  let lastPort = 0

  const checkPort = async () => {
    const currentPort = await detectFrontendPort()
    if (currentPort !== lastPort) {
      lastPort = currentPort
      callback(currentPort)
    }
  }

  // 立即执行一次
  checkPort()

  // 定时检查
  return setInterval(checkPort, checkInterval)
}

/**
 * 清理端口同步文件
 */
export const clearPortSync = (): void => {
  try {
    if (fs.existsSync(PORT_SYNC_FILE)) {
      fs.unlinkSync(PORT_SYNC_FILE)
      console.log('🗑️ 端口同步文件已清理')
    }
  } catch (error) {
    console.error('❌ 清理端口同步文件失败:', error)
  }
}