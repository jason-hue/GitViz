# CORS配置优化文档

## 概述

为了彻底解决CORS问题并避免未来出现类似问题，我们对GitViz项目的CORS配置进行了全面优化。

## 主要改进

### 1. 动态CORS配置
- **智能环境检测**: 自动识别开发/生产环境
- **灵活的域名管理**: 支持多个前端域名配置
- **开发环境友好**: 自动允许localhost任何端口
- **生产环境安全**: 严格限制允许的域名

### 2. 配置文件结构
```
backend/
├── src/config/cors.ts          # CORS配置逻辑
├── src/middleware/corsDebug.ts # CORS调试中间件
├── .env                        # 开发环境配置
└── .env.production.example     # 生产环境配置示例
```

### 3. 环境变量配置

#### 开发环境 (.env)
```env
# 开发环境：自动处理 localhost 端口
DEV_FRONTEND_URLS=http://localhost:3000,http://localhost:3001,http://localhost:3002

# 生产环境：必须配置允许的前端域名（多个用逗号分隔）
# PROD_FRONTEND_URLS=https://yourdomain.com,https://www.yourdomain.com
```

#### 生产环境 (.env.production)
```env
# 生产环境必须配置允许的域名
PROD_FRONTEND_URLS=https://yourdomain.com,https://www.yourdomain.com
```

## 功能特性

### 1. 开发环境特性
- ✅ 自动允许localhost任何端口（3000-3005）
- ✅ 支持127.0.0.1和localhost
- ✅ 可配置额外的开发域名
- ✅ 详细的调试日志

### 2. 生产环境特性
- ✅ 严格的域名白名单
- ✅ 安全的CORS策略
- ✅ 错误时返回安全信息
- ✅ 配置验证和警告

### 3. 调试功能
- 📝 详细的CORS请求日志
- 🔍 预检请求监控
- 🚫 CORS错误处理
- 💡 开发环境配置建议

## 使用方法

### 1. 开发环境
```bash
# 启动开发服务器
npm run dev

# 查看CORS配置日志
# 服务器启动时会显示CORS配置信息
```

### 2. 生产环境
```bash
# 1. 复制生产环境配置
cp .env.production.example .env.production

# 2. 编辑生产环境配置
vim .env.production

# 3. 启动生产服务器
npm start
```

### 3. 添加新的前端域名
```env
# 开发环境
DEV_FRONTEND_URLS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://new-dev-url:3000

# 生产环境
PROD_FRONTEND_URLS=https://yourdomain.com,https://new.yourdomain.com
```

## 故障排除

### 1. 常见CORS错误
```
Access to XMLHttpRequest at 'http://localhost:8000/api' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**解决方案:**
1. 检查后端CORS配置
2. 确认前端端口在允许列表中
3. 查看后端CORS调试日志

### 2. 预检请求失败
```
Response to preflight request doesn't pass access control check
```

**解决方案:**
1. 检查请求方法是否被允许
2. 确认请求头配置正确
3. 查看详细错误日志

### 3. Credentials错误
```
Credentials mode is 'include', but CORS response doesn't include Access-Control-Allow-Credentials
```

**解决方案:**
1. 确保前后端都设置了credentials: true
2. 检查CORS配置中的credentials设置

## 配置验证

### 1. 自动验证
服务器启动时会自动验证CORS配置：
- ✅ 检查生产环境必需的配置项
- ✅ 显示配置摘要
- ⚠️ 警告潜在的配置问题

### 2. 手动测试
```bash
# 测试CORS配置
curl -X OPTIONS http://localhost:8000/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

## 安全建议

### 1. 生产环境
- 🔒 始终配置具体的允许域名
- 🔒 定期审核允许的域名列表
- 🔒 使用HTTPS
- 🔒 避免使用通配符

### 2. 开发环境
- 🔧 仅在开发时使用宽松的CORS策略
- 🔧 定期清理开发域名配置
- 🔧 利用调试日志监控请求

## 性能优化

### 1. 缓存策略
- 设置合适的max-age（24小时）
- 缓存预检请求结果
- 减少不必要的OPTIONS请求

### 2. 请求处理
- 高效的origin验证逻辑
- 最小化的配置检查开销
- 智能的错误处理

## 未来扩展

### 1. 动态配置
- 支持运行时配置更新
- 数据库存储的域名白名单
- 管理界面配置

### 2. 高级功能
- 请求速率限制
- 域名验证增强
- 实时监控告警

## 总结

通过这次优化，GitViz项目的CORS配置现在具有：
- 🎯 **准确性**: 正确的跨域请求处理
- 🔒 **安全性**: 生产环境严格限制
- 🛠️ **可维护性**: 清晰的配置结构
- 🔍 **可调试性**: 详细的日志信息
- 📈 **可扩展性**: 易于添加新域名

这确保了项目的长期稳定性和安全性。