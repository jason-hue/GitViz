# GitViz - Git 仓库可视化管理系统

GitViz 是一个现代化的 Git 仓库可视化管理系统，提供直观的界面来管理 Git 仓库、分支、提交和团队协作。

## 🚀 功能特性

### 核心功能
- **仓库管理** - 添加、删除、克隆 Git 仓库
- **分支管理** - 查看、创建、删除、合并分支
- **提交历史** - 可视化提交记录和时间线
- **文件管理** - 在线浏览、编辑、上传文件
- **团队协作** - 多用户协作和权限管理

### 管理员功能
- **用户管理** - 创建、编辑、删除用户账户
- **系统统计** - 查看用户、仓库、提交统计数据
- **系统设置** - 配置系统参数和限制
- **权限控制** - 基于角色的访问控制

### 技术特性
- **现代化界面** - 基于 React + Ant Design 的响应式设计
- **RESTful API** - 基于 Express.js 的后端服务
- **实时同步** - 与 Git 仓库实时同步
- **安全认证** - JWT token 认证和权限管理
- **数据库支持** - Sequelize ORM 支持 PostgreSQL/MySQL

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript
- **Ant Design** - 企业级 UI 组件库
- **React Router** - 路由管理
- **Redux Toolkit** - 状态管理
- **Axios** - HTTP 客户端

### 后端
- **Node.js** - 运行时环境
- **Express.js** - Web 应用框架
- **TypeScript** - 类型安全的 JavaScript
- **Sequelize** - ORM 框架
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **Helmet** - 安全头部
- **CORS** - 跨域资源共享

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Nodemon** - 开发环境热重载

## 📦 安装说明

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0
- PostgreSQL 或 MySQL (可选，默认使用 SQLite)

### 克隆项目
```bash
git clone https://github.com/yourusername/gitviz.git
cd gitviz
```

### 后端安装
```bash
cd backend
npm install
```

### 前端安装
```bash
cd frontend
npm install
```

## ⚙️ 配置说明

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

# 前端 URL
FRONTEND_URL=http://localhost:3000

# GitHub OAuth (可选)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8000/api/auth/github/callback

# 速率限制
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 前端配置
创建 `frontend/.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🚀 运行项目

### 开发环境

1. 启动后端服务：
```bash
cd backend
npm run dev
```

2. 启动前端服务：
```bash
cd frontend
npm run dev
```

3. 访问应用：
- 前端界面：http://localhost:3000
- 后端 API：http://localhost:8000/api

### 生产环境

1. 构建前端：
```bash
cd frontend
npm run build
```

2. 构建后端：
```bash
cd backend
npm run build
```

3. 启动生产服务：
```bash
cd backend
npm start
```

## 🧪 测试账户

### 管理员账户
- **用户名**: `admin`
- **密码**: `admin123`
- **权限**: 完整管理员权限

### 普通用户账户
- **用户名**: `demo`
- **密码**: `demo123`
- **权限**: 普通用户权限

## 📖 使用指南

### 基本功能

#### 1. 仓库管理
- 在"仓库管理"页面添加新的 Git 仓库
- 支持通过 URL 克隆现有仓库
- 查看仓库基本信息和统计

#### 2. 分支管理
- 在"分支管理"页面查看所有分支
- 创建新分支、删除分支
- 合并分支操作

#### 3. 提交历史
- 在"提交历史"页面查看提交记录
- 支持按分支筛选提交
- 查看提交详情和文件变更

#### 4. 文件管理
- 在线浏览仓库文件
- 编辑文件内容
- 上传新文件
- 创建目录

### 管理员功能

#### 1. 用户管理
- 创建新用户账户
- 编辑用户信息
- 启用/禁用用户
- 删除用户及其数据

#### 2. 系统设置
- 配置用户注册开关
- 设置仓库数量限制
- 配置文件大小限制
- 设置允许的文件类型

#### 3. 系统统计
- 查看用户总数和活跃用户数
- 查看仓库总数和提交总数
- 监控系统使用情况

## 🔒 安全特性

### 认证与授权
- JWT token 认证
- 密码 bcrypt 加密
- 基于角色的权限控制
- 管理员权限验证

### 安全措施
- Helmet 安全头部
- CORS 跨域保护
- 请求速率限制
- 输入验证和过滤
- SQL 注入防护

## 📊 API 文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 仓库接口
- `GET /api/repositories` - 获取仓库列表
- `POST /api/repositories` - 创建仓库
- `GET /api/repositories/:id` - 获取仓库详情
- `PUT /api/repositories/:id` - 更新仓库
- `DELETE /api/repositories/:id` - 删除仓库

### Git 操作接口
- `GET /api/repositories/:id/commits` - 获取提交历史
- `GET /api/repositories/:id/branches` - 获取分支列表
- `GET /api/repositories/:id/files` - 获取文件列表
- `POST /api/repositories/:id/commit` - 提交更改

### 管理员接口
- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users` - 创建用户
- `PUT /api/admin/users/:id` - 更新用户
- `DELETE /api/admin/users/:id` - 删除用户
- `GET /api/admin/stats` - 获取系统统计
- `GET /api/admin/settings` - 获取系统设置

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用  Apache-2.0 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面框架
- [Ant Design](https://ant.design/) - UI 组件库
- [Express.js](https://expressjs.com/) - Web 应用框架
- [Sequelize](https://sequelize.org/) - ORM 框架

## 📞 联系我们

- 项目地址：https://github.com/yourusername/gitviz
- 问题反馈：https://github.com/yourusername/gitviz/issues
- 邮箱：your.email@example.com

---

⭐ 如果这个项目对你有帮助，请给个星标！
