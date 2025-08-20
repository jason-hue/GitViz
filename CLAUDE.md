# GitViz 项目 - Claude 开发助手指南

## 项目概述

GitViz 是一个现代化的 Git 仓库可视化管理系统，提供直观的界面来管理 Git 仓库、分支、提交和团队协作。

### 技术栈
- **前端**: React 18 + TypeScript + Ant Design + Redux Toolkit
- **后端**: Node.js + Express + TypeScript + Sequelize
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **认证**: JWT + bcryptjs

## 项目结构

```
gitviz/
├── frontend/                 # React 前端应用
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # 可复用组件
│   │   ├── services/       # API 服务
│   │   ├── store/          # Redux 状态管理
│   │   └── types/          # TypeScript 类型定义
│   └── tests/              # Playwright 测试
├── backend/                 # Node.js 后端服务
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── models/         # 数据库模型
│   │   ├── middleware/     # 中间件
│   │   ├── config/         # 配置文件
│   │   └── services/       # 业务逻辑
│   └── database.sqlite     # SQLite 数据库文件
└── docs/                   # 项目文档
```

## 开发环境

### 运行命令
```bash
# 启动后端服务
cd backend && npm run dev

# 启动前端服务
cd frontend && npm run dev

# 运行测试
cd frontend && npm test

# 构建项目
cd frontend && npm run build
cd backend && npm run build
```

### 端口配置
- **前端**: http://localhost:3000
- **后端**: http://localhost:8000
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
PORT=8000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gitviz
DB_USER=your_username
DB_PASS=your_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
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

最后更新：2024-08-20