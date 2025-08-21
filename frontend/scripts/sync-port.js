#!/usr/bin/env node

/**
 * 前端端口同步脚本
 * 在前端启动时自动检测端口并同步到后端
 */

import fs from 'fs'
import path from 'path'
import net from 'net'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PORT_SYNC_FILE = path.join(__dirname, '../frontend-port.json')
const BACKEND_PORT_FILE = path.join(__dirname, '../../backend/backend-port.json')

/**
 * 查找可用端口
 */
function findAvailablePort(startPort, endPort) {
  return new Promise((resolve, reject) => {
    const tryPort = (port) => {
      if (port > endPort) {
        reject(new Error(`No available ports between ${startPort} and ${endPort}`))
        return
      }

      const server = net.createServer()
      server.listen(port, () => {
        const { port: availablePort } = server.address()
        server.close(() => {
          resolve(availablePort)
        })
      })

      server.on('error', () => {
        tryPort(port + 1)
      })
    }

    tryPort(startPort)
  })
}

/**
 * 保存端口信息
 */
function savePortInfo(port) {
  try {
    const portData = {
      port,
      timestamp: new Date().toISOString(),
      source: 'frontend-startup'
    }
    
    fs.writeFileSync(PORT_SYNC_FILE, JSON.stringify(portData, null, 2))
    console.log(`💾 前端端口信息已保存: ${port}`)
    
    // 同时保存后端端口信息
    const backendPort = port + 5000
    const backendPortData = {
      backendPort: backendPort,
      frontendPort: port,
      timestamp: new Date().toISOString(),
      source: 'frontend-startup'
    }
    
    fs.writeFileSync(BACKEND_PORT_FILE, JSON.stringify(backendPortData, null, 2))
    console.log(`💾 后端端口信息已保存: ${backendPort}`)
    
    return true
  } catch (error) {
    console.error('❌ 保存端口信息失败:', error)
    return false
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始前端端口检测...')
  
  try {
    // 查找可用端口
    const port = await findAvailablePort(3000, 3005)
    console.log(`✅ 找到可用端口: ${port}`)
    
    // 保存端口信息
    const saved = savePortInfo(port)
    
    if (saved) {
      console.log(`🎉 前端端口同步完成！`)
      console.log(`📝 端口: ${port}`)
      console.log(`🌐 访问地址: http://localhost:${port}`)
      
      // 输出环境变量
      console.log(`\n🔧 环境变量设置:`)
      console.log(`export FRONTEND_PORT=${port}`)
      
      // 返回端口供脚本使用
      process.exit(0)
    } else {
      console.error('❌ 端口信息保存失败')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 端口检测失败:', error.message)
    process.exit(1)
  }
}

// 运行主函数
main()