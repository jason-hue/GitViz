import net from 'net'
import fs from 'fs'
import path from 'path'

/**
 * 后端端口管理工具
 * 根据前端端口动态分配后端端口
 */

const PORT_SYNC_FILE = path.join(__dirname, '../../frontend-port.json')
const BACKEND_PORT_FILE = path.join(__dirname, '../../backend-port.json')

/**
 * 根据前端端口计算对应的后端端口
 * @param frontendPort 前端端口
 * @returns 后端端口
 */
export const calculateBackendPort = (frontendPort: number): number => {
  // 后端端口 = 前端端口 + 5000
  // 这样前端 3000 -> 后端 8000
  // 前端 3001 -> 后端 8001，以此类推
  const backendPort = frontendPort + 5000
  
  // 确保端口在合理范围内
  if (backendPort < 8000 || backendPort > 8999) {
    console.warn(`⚠️ 计算的后端端口 ${backendPort} 超出预期范围，使用默认端口 8000`)
    return 8000
  }
  
  return backendPort
}

/**
 * 查找可用的后端端口
 * @param preferredPort 优先使用的端口
 * @param startPort 起始端口
 * @param endPort 结束端口
 * @returns 可用的端口
 */
export const findAvailableBackendPort = async (
  preferredPort: number = 8000,
  startPort: number = 8000,
  endPort: number = 8999
): Promise<number> => {
  // 首先尝试优先端口
  if (preferredPort >= startPort && preferredPort <= endPort) {
    if (await isPortAvailable(preferredPort)) {
      return preferredPort
    }
  }
  
  // 扫描端口范围
  for (let port = startPort; port <= endPort; port++) {
    if (await isPortAvailable(port)) {
      return port
    }
  }
  
  throw new Error(`No available ports between ${startPort} and ${endPort}`)
}

/**
 * 检查端口是否可用
 * @param port 端口号
 * @returns 是否可用
 */
export const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer()
    
    server.listen(port, () => {
      server.close(() => {
        resolve(true) // 端口可用
      })
    })

    server.on('error', () => {
      resolve(false) // 端口被占用
    })
  })
}

/**
 * 获取当前前端端口
 * @returns 前端端口
 */
export const getCurrentFrontendPort = async (): Promise<number> => {
  try {
    // 首先检查端口同步文件
    if (fs.existsSync(PORT_SYNC_FILE)) {
      const portData = JSON.parse(fs.readFileSync(PORT_SYNC_FILE, 'utf8'))
      const frontendPort = portData.port
      
      // 验证前端服务是否真的在运行
      if (await isFrontendRunning(frontendPort)) {
        console.log(`🔗 检测到前端运行在端口: ${frontendPort}`)
        return frontendPort
      }
    }
    
    // 扫描前端端口
    const frontendPort = await scanFrontendPort()
    console.log(`🔍 扫描到前端端口: ${frontendPort}`)
    return frontendPort
  } catch (error) {
    console.log('⚠️ 无法检测前端端口，使用默认端口 3000')
    return 3000
  }
}

/**
 * 扫描前端端口
 * @param startPort 起始端口
 * @param endPort 结束端口
 * @returns 前端端口
 */
export const scanFrontendPort = async (
  startPort: number = 3000,
  endPort: number = 3005
): Promise<number> => {
  for (let port = startPort; port <= endPort; port++) {
    if (await isFrontendRunning(port)) {
      return port
    }
  }
  
  // 如果没有找到运行的前端，返回默认端口
  return startPort
}

/**
 * 检查前端是否在指定端口运行
 * @param port 端口号
 * @returns 是否运行
 */
export const isFrontendRunning = async (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: 'localhost' })
    
    socket.on('connect', () => {
      socket.destroy()
      resolve(true)
    })
    
    socket.on('error', () => {
      resolve(false)
    })
    
    // 设置超时
    socket.setTimeout(1000, () => {
      socket.destroy()
      resolve(false)
    })
  })
}

/**
 * 保存后端端口信息
 * @param port 后端端口
 * @param frontendPort 对应的前端端口
 */
export const saveBackendPortInfo = (port: number, frontendPort: number): void => {
  try {
    const portData = {
      backendPort: port,
      frontendPort,
      timestamp: new Date().toISOString(),
      source: 'backend-startup'
    }
    
    // 只在端口文件不存在时写入，避免nodemon重启
    if (!fs.existsSync(BACKEND_PORT_FILE)) {
      fs.writeFileSync(BACKEND_PORT_FILE, JSON.stringify(portData, null, 2))
      console.log(`💾 后端端口信息已保存: ${port} (前端: ${frontendPort})`)
    } else {
      console.log(`📝 后端端口信息: ${port} (前端: ${frontendPort})`)
    }
  } catch (error) {
    console.error('❌ 保存后端端口信息失败:', error)
  }
}

/**
 * 获取最佳后端端口
 * @returns 后端端口
 */
export const getOptimalBackendPort = async (): Promise<number> => {
  try {
    // 获取当前前端端口
    const frontendPort = await getCurrentFrontendPort()
    
    // 计算对应的后端端口
    const preferredBackendPort = calculateBackendPort(frontendPort)
    
    // 查找可用的后端端口
    const backendPort = await findAvailableBackendPort(preferredBackendPort)
    
    // 保存端口信息
    saveBackendPortInfo(backendPort, frontendPort)
    
    console.log(`🎯 后端端口分配完成:`)
    console.log(`   前端端口: ${frontendPort}`)
    console.log(`   后端端口: ${backendPort}`)
    
    return backendPort
  } catch (error) {
    console.error('❌ 获取后端端口失败:', error)
    return 8000 // 返回默认端口
  }
}

/**
 * 清理端口文件
 */
export const clearPortFiles = (): void => {
  try {
    if (fs.existsSync(BACKEND_PORT_FILE)) {
      fs.unlinkSync(BACKEND_PORT_FILE)
      console.log('🗑️ 后端端口文件已清理')
    }
  } catch (error) {
    console.error('❌ 清理后端端口文件失败:', error)
  }
}