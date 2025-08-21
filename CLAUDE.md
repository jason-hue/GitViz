# GitViz 项目 - Claude 开发助手指南

## 项目概述

GitViz 是一个现代化的 Git 仓库可视化管理系统，提供直观的界面来管理 Git 仓库、分支、提交和团队协作。

### 最新版本: v1.1.0
- **消息系统优化**: 双重消息显示机制，确保用户反馈
- **CORS 配置优化**: 智能环境检测和动态域名管理
- **端口管理增强**: 智能端口分配和实时监控
- **开发体验改进**: 健康检查、调试工具、测试框架

### 技术栈
- **前端**: React 18 + TypeScript + Ant Design + Redux Toolkit + Vite
- **后端**: Node.js + Express + TypeScript + Sequelize
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **认证**: JWT + bcryptjs
- **测试**: Playwright + Testing Library
- **构建工具**: Vite + Nodemon

## 项目结构

```
gitviz/
├── frontend/                 # React 前端应用
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # 可复用组件
│   │   ├── services/       # API 服务
│   │   ├── store/          # Redux 状态管理
│   │   ├── types/          # TypeScript 类型定义
│   │   └── utils/          # 工具函数
│   ├── tests/              # Playwright 测试
│   └── public/             # 静态资源
├── backend/                 # Node.js 后端服务
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── models/         # 数据库模型
│   │   ├── middleware/     # 中间件
│   │   ├── config/         # 配置文件
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   └── database.sqlite     # SQLite 数据库文件
└── docs/                   # 项目文档
```

## 开发环境

### 运行命令
```bash
# 安装依赖
cd backend && npm install
cd frontend && npm install

# 启动后端服务
cd backend && npm run dev

# 启动前端服务
cd frontend && npm run dev

# 运行测试
cd frontend && npm test

# 构建项目
cd frontend && npm run build
cd backend && npm run build

# 生产环境
cd backend && npm run dev:simple  # 简化生产模式
cd frontend && npx vite preview --port 3001 --host 0.0.0.0
```

### 智能端口配置
- **后端**: 默认 8000，冲突时自动选择
- **前端**: 默认 3001，冲突时自动选择
- **健康检查**: http://localhost:8000/health
- **API**: http://localhost:8000/api

## 核心功能

### 1. 用户认证系统
- 登录/注册功能
- JWT token 认证
- 权限管理（管理员/普通用户）

### 2. 仓库管理
- 添加/删除/克隆 Git 仓库
- 仓库信息展示
- 仓库统计

### 3. 分支管理
- 查看分支列表
- 创建/删除分支
- 分支合并

### 4. 提交历史
- 查看提交记录
- 提交详情
- 文件变更对比

### 5. 文件管理
- 在线浏览文件
- 编辑文件内容
- 上传文件
- 创建目录

### 6. 管理员功能
- 用户管理（CRUD）
- 系统统计
- 系统设置

### 7. 系统监控和诊断
- 健康检查和状态监控
- CORS 配置和调试
- 端口管理和冲突检测
- 错误日志和调试信息

## 测试账户

### 管理员账户
- **用户名**: `admin`
- **密码**: `admin123`
- **权限**: 完整管理员权限

### 普通用户账户
- **用户名**: `demo`
- **密码**: `demo123`
- **权限**: 普通用户权限

## 权限控制

### 管理员权限
- 用户ID 为 1 或 4 的用户拥有管理员权限
- 可以访问 `/admin` 页面
- 可以管理所有用户和系统设置

### 普通用户权限
- 只能访问自己的仓库和功能
- 无法访问管理员功能

## 新功能特性

### 1. 智能消息系统
- **双重显示机制**: Ant Design 消息 + 页面内消息显示
- **错误处理改进**: 详细的错误信息展示和自动清除
- **用户体验提升**: 成功/错误消息自动消失，避免界面混乱

### 2. CORS 配置优化
- **智能环境检测**: 自动识别开发/生产环境
- **动态域名管理**: 支持多个前端域名配置
- **开发环境友好**: 自动允许 localhost 任何端口
- **生产环境安全**: 严格限制允许的域名

### 3. 端口管理增强
- **智能端口分配**: 自动检测可用端口
- **实时监控**: 监控端口变化，动态更新配置
- **冲突解决**: 端口占用时自动选择备用端口
- **CORS 自动更新**: 端口变化时自动更新跨域配置

### 4. 开发体验改进
- **健康检查**: 完整的服务监控和诊断
- **调试工具**: 详细的调试日志和错误追踪
- **测试框架**: Playwright 端到端测试支持
- **类型安全**: 完整的 TypeScript 类型定义

## API 端点

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户
- `POST /api/auth/logout` - 用户登出

### 仓库相关
- `GET /api/repositories` - 获取仓库列表
- `POST /api/repositories` - 创建仓库
- `GET /api/repositories/:id` - 获取仓库详情
- `PUT /api/repositories/:id` - 更新仓库
- `DELETE /api/repositories/:id` - 删除仓库

### Git 操作相关
- `GET /api/repositories/:id/commits` - 获取提交历史
- `GET /api/repositories/:id/branches` - 获取分支列表
- `GET /api/repositories/:id/files` - 获取文件列表
- `POST /api/repositories/:id/commit` - 提交更改

### 管理员相关
- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users` - 创建用户
- `PUT /api/admin/users/:id` - 更新用户
- `DELETE /api/admin/users/:id` - 删除用户
- `GET /api/admin/stats` - 获取系统统计
- `GET /api/admin/settings` - 获取系统设置

## 数据库模型

### User 模型
```typescript
interface User {
  id: number
  username: string
  email: string
  password: string
  avatar?: string
  githubId?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Repository 模型
```typescript
interface Repository {
  id: number
  name: string
  description?: string
  url: string
  userId: number
  isPrivate: boolean
  branchCount: number
  commitCount: number
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}
```

## 开发规范

### 代码风格
- 使用 TypeScript 进行类型检查
- 使用 ESLint 和 Prettier 格式化代码
- 遵循 React 和 Express 最佳实践

### 文件命名
- 组件文件使用 PascalCase (e.g., `DashboardPage.tsx`)
- 工具函数使用 camelCase (e.g., `formatDate.ts`)
- 样式文件使用 kebab-case (e.g., `main-styles.css`)

### 提交规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式化
- refactor: 重构代码
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 部署说明

### 环境变量
创建 `backend/.env` 文件：

```env
# 服务器配置
PORT=8000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gitviz
DB_USER=your_username
DB_PASS=your_password

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# CORS 配置（开发环境支持多个域名）
DEV_FRONTEND_URLS=http://localhost:3000,http://localhost:3001,http://localhost:3002

# GitHub OAuth (可选)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8000/api/auth/github/callback

# 速率限制
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 前端配置
创建 `frontend/.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 构建和部署
```bash
# 构建前端
cd frontend && npm run build

# 构建后端
cd backend && npm run build

# 启动生产服务
cd backend && npm start
```

## 常见问题

### 1. 数据库连接问题
- 检查 `.env` 文件中的数据库配置
- 确保数据库服务正在运行
- 检查数据库用户权限

### 2. JWT 认证问题
- 检查 `JWT_SECRET` 环境变量
- 确保前端正确存储和发送 token
- 检查 token 过期时间

### 3. 权限问题
- 确保用户 ID 正确
- 检查管理员权限配置
- 验证前端权限控制逻辑

### 4. CORS 问题
- 检查 `DEV_FRONTEND_URLS` 环境变量配置
- 确认前端端口在允许列表中
- 查看后端 CORS 调试日志
- 验证预检请求处理

### 5. 端口冲突问题
- 检查端口占用情况
- 确认智能端口分配功能正常
- 查看端口监控日志
- 验证 CORS 配置自动更新

## 扩展功能

### 待实现功能
- [ ] GitHub 集成
- [ ] 实时通知
- [ ] 高级搜索
- [ ] 数据导出
- [ ] Webhooks
- [ ] CI/CD 集成
- [ ] 移动端适配

### 性能优化
- [ ] 数据库索引优化
- [ ] 缓存策略
- [ ] 图片压缩
- [ ] 代码分割
- [ ] 懒加载

## 联系信息

- 项目仓库：https://github.com/yourusername/gitviz
- 问题反馈：https://github.com/yourusername/gitviz/issues
- 邮箱：your.email@example.com

---

最后更新：2025-08-21

### 重要提醒
- 项目现在支持智能端口分配，无需手动修改端口配置
- CORS 配置已优化，支持多域名开发和生产环境
- 消息系统已修复，确保用户反馈正常显示
- 健康检查端点：`GET /health`