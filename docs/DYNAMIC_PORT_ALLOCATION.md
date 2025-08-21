# 动态端口分配系统

## 系统概述

GitViz 现在支持动态端口分配，前端可以自动占用空闲端口，后端会自动检测并调整 CORS 配置，确保系统在不同环境下都能正常运行。

## 功能特性

### 1. 前端动态端口分配
- ✅ **自动端口检测**: 在 3000-3005 范围内自动查找可用端口
- ✅ **避免冲突**: 自动跳过已占用的端口
- ✅ **随机分配**: 每次启动时选择最优可用端口
- ✅ **端口同步**: 自动将端口信息同步到后端

### 2. 后端端口检测与监控
- ✅ **实时监控**: 每 5 秒检测前端端口变化
- ✅ **自动适应**: 后端 CORS 配置自动调整
- ✅ **文件同步**: 通过 JSON 文件同步端口信息
- ✅ **多端口支持**: 同时支持 localhost 和 127.0.0.1

### 3. 智能CORS配置
- ✅ **动态域名**: 根据检测到的端口自动更新允许的域名
- ✅ **开发友好**: 开发环境支持任何 localhost 端口
- ✅ **生产安全**: 生产环境保持严格的域名白名单
- ✅ **实时更新**: 端口变化时 CORS 配置立即生效

## 工作原理

### 1. 前端启动流程
```
1. 执行 sync-port.js 脚本
2. 检测 3000-3005 范围内的可用端口
3. 将端口信息写入 frontend-port.json
4. Vite 使用检测到的端口启动
```

### 2. 后端监控流程
```
1. 启动时读取 frontend-port.json
2. 扫描 3000-3005 端口检测运行中的前端
3. 启动定时监控 (每 5 秒)
4. 检测到端口变化时更新 CORS 配置
```

### 3. CORS 配置流程
```
1. 初始配置使用同步版本 (configureCorsSync)
2. 端口变化时重新生成 CORS 配置
3. 自动添加检测到的端口到允许列表
4. 保持开发环境的灵活性
```

## 文件结构

```
gitviz/
├── frontend/
│   ├── vite.config.ts                    # 动态端口配置
│   ├── scripts/
│   │   └── sync-port.js                 # 端口同步脚本
│   ├── src/utils/portUtils.ts          # 端口工具函数
│   └── frontend-port.json              # 端口同步文件
└── backend/
    ├── src/
    │   ├── config/cors.ts              # 动态 CORS 配置
    │   ├── utils/portDetector.ts       # 端口检测工具
    │   └── index.ts                    # 服务器入口
    └── frontend-port.json              # 端口同步文件 (链接)
```

## 使用方法

### 1. 启动前端 (动态端口)
```bash
cd frontend
npm run dev
```

### 2. 启动前端 (固定端口)
```bash
cd frontend
npm run dev:dynamic
```

### 3. 启动后端
```bash
cd backend
npm run dev
```

### 4. 手动同步端口
```bash
cd frontend
npm run sync-port
```

## 配置选项

### 1. 端口范围
- **前端端口范围**: 3000-3005
- **后端端口**: 固定 8000
- **检测间隔**: 5 秒

### 2. 环境变量
```env
# 开发环境 (可选)
DEV_FRONTEND_URLS=http://localhost:3000,http://localhost:3001

# 生产环境 (必需)
PROD_FRONTEND_URLS=https://yourdomain.com,https://www.yourdomain.com
```

## 测试验证

### 1. 功能测试
- ✅ 前端自动分配端口 (3004)
- ✅ 后端自动检测端口变化
- ✅ CORS 配置自动更新
- ✅ API 调用正常工作

### 2. 端口测试
```bash
# 测试前端访问
curl http://localhost:3004/

# 测试 CORS 预检请求
curl -X OPTIONS http://localhost:8000/api/auth/login \
  -H "Origin: http://localhost:3004" \
  -H "Access-Control-Request-Method: POST"

# 测试 API 调用
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3004" \
  -d '{"username":"admin","password":"admin123"}'
```

## 日志输出

### 1. 前端日志
```
🔍 开始前端端口检测...
✅ 找到可用端口: 3004
💾 前端端口信息已保存: 3004
🎉 前端端口同步完成！

Port 3003 is in use, trying another one...
➜  Local:   http://localhost:3004/
```

### 2. 后端日志
```
🔍 扫描前端端口 3000-3005...
✅ 检测到前端运行在端口: 3004
💾 端口同步信息已保存: 3004
🔍 初始前端端口检测: 3004
🔄 前端端口变化: 3004
🎯 CORS配置已更新
🔓 允许动态开发域名: http://localhost:3004
```

## 故障排除

### 1. 端口冲突
如果所有端口都被占用：
```bash
# 检查端口占用
netstat -tulpn | grep :3000

# 杀死占用进程
kill -9 <PID>
```

### 2. 同步文件问题
如果端口同步文件损坏：
```bash
# 删除同步文件
rm frontend-port.json

# 重启服务
npm run dev
```

### 3. CORS 问题
如果出现 CORS 错误：
1. 确认后端正在运行
2. 检查端口同步文件是否存在
3. 查看后端日志中的端口检测信息
4. 手动触发端口同步

## 性能优化

### 1. 端口检测优化
- 使用异步端口检测
- 缓存端口检测结果
- 最小化检测间隔

### 2. CORS 配置优化
- 延迟加载 CORS 配置
- 避免频繁配置更新
- 使用同步版本作为默认

### 3. 文件同步优化
- 使用 JSON 格式存储
- 添加时间戳验证
- 支持多实例检测

## 扩展功能

### 1. 多实例支持
- 支持多个前端实例同时运行
- 自动分配不同端口
- 独立的 CORS 配置

### 2. 环境感知
- 自动检测开发/生产环境
- 根据环境调整端口策略
- 智能错误处理

### 3. 监控告警
- 端口变化通知
- 异常情况告警
- 性能指标收集

## 总结

动态端口分配系统解决了开发环境中的端口冲突问题，提供了：

1. **自动化**: 无需手动配置端口
2. **智能化**: 自动检测和适应端口变化
3. **可靠性**: 确保跨域请求正常工作
4. **扩展性**: 支持多实例和多环境

这个系统使 GitViz 在各种开发环境下都能稳定运行，大大提高了开发效率。