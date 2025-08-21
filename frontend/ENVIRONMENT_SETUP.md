# 前端环境变量配置指南

## 开发环境配置

### 1. 基础配置 (.env)
```env
# API配置 - 使用相对路径避免CORS问题
VITE_API_BASE_URL=/api

# 应用配置
VITE_APP_NAME=GitViz
VITE_APP_VERSION=1.0.0

# GitHub OAuth配置（可选）
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 2. Vite代理配置 (vite.config.ts)
Vite 会自动将 `/api` 请求代理到后端，避免前端直接跨域：

```typescript
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

## 生产环境配置

### 1. 生产环境配置 (.env.production)
```env
# API配置 - 生产环境使用完整URL
VITE_API_BASE_URL=https://api.yourdomain.com

# 应用配置
VITE_APP_NAME=GitViz
VITE_APP_VERSION=1.0.0

# GitHub OAuth配置
VITE_GITHUB_CLIENT_ID=your_production_github_client_id
```

### 2. 后端CORS配置
确保后端已配置生产环境的CORS：

```env
# 后端 .env.production
PROD_FRONTEND_URLS=https://yourdomain.com,https://www.yourdomain.com
```

## 避免CORS错误的最佳实践

### 1. 开发环境
- ✅ 使用Vite代理（推荐）
- ✅ 使用相对路径 `/api`
- ✅ 后端配置开发CORS规则

### 2. 生产环境
- ✅ 前端使用完整API URL
- ✅ 后端严格配置允许的域名
- ✅ 使用HTTPS
- ✅ 配置正确的Cookie域名

### 3. 常见问题解决
- **问题**: `Access-Control-Allow-Origin` 错误
- **解决**: 检查后端CORS配置和前端API URL

- **问题**: Credentials相关错误
- **解决**: 确保前后端都设置了 `credentials: true`

- **问题**: 预检请求失败
- **解决**: 检查请求头和方法是否被允许

## 环境变量优先级

Vite按以下优先级加载环境变量：
1. `.env.[mode].local`
2. `.env.[mode]` 
3. `.env.local`
4. `.env`

## 测试不同环境

```bash
# 开发环境
npm run dev

# 生产环境构建
npm run build
npm run preview

# 自定义环境
npm run dev -- --mode staging
```

## 安全注意事项

- 永远不要在前端环境变量中存储敏感信息
- 所有以 `VITE_` 开头的变量都会被暴露给客户端
- 敏感配置应该存储在后端环境变量中