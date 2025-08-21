import net from 'net'

/**
 * 查找可用端口
 * @param startPort 起始端口
 * @param endPort 结束端口
 * @returns 可用端口
 */
export const findAvailablePort = (startPort: number, endPort: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const tryPort = (port: number) => {
      if (port > endPort) {
        reject(new Error(`No available ports between ${startPort} and ${endPort}`))
        return
      }

      const server = net.createServer()
      server.listen(port, () => {
        const { port: availablePort } = server.address() as any
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
 * 检查端口是否可用
 * @param port 端口号
 * @returns 是否可用
 */
export const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(port, () => {
      server.close(() => {
        resolve(true)
      })
    })

    server.on('error', () => {
      resolve(false)
    })
  })
}

/**
 * 获取当前前端端口（从环境变量或默认值）
 */
export const getFrontendPort = (): number => {
  return parseInt(process.env.FRONTEND_PORT || '3000', 10)
}