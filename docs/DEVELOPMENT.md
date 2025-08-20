# GitViz 开发指南

## 项目概述

GitViz 是一个现代化的 Web-based Git 仓库可视化管理平台，提供直观的图形界面来管理和分析 Git 仓库。

## 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript
- **Redux Toolkit** - 状态管理
- **Ant Design** - UI 组件库
- **D3.js** - 数据可视化
- **Vite** - 构建工具

### 后端
- **Node.js** - 运行时环境
- **Express** - Web 框架
- **TypeScript** - 类型安全的 JavaScript
- **PostgreSQL** - 关系型数据库
- **Sequelize** - ORM 框架
- **JWT** - 身份认证
- **Passport** - 认证中间件
- **Simple Git** - Git 操作库

## 开发环境设置

### 前置要求
- Node.js 16+
- Docker & Docker Compose
- PostgreSQL 12+ (可选，Docker 会自动创建)

### 快速启动

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd gitviz
   ```

2. **配置环境变量**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **启动开发环境**
   ```bash
   ./scripts/dev-start.sh
   ```

4. **访问应用**
   - 前端: http://localhost:3000
   - 后端 API: http://localhost:8000
   - 健康检查: http://localhost:8000/health

### 手动启动（不使用 Docker）

1. **启动数据库**
   ```bash
   # 使用 Docker 启动 PostgreSQL
   docker run -d --name postgres \
     -e POSTGRES_DB=gitviz \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=your_password \
     -p 5432:5432 \
     postgres:15
   ```

2. **初始化数据库**
   ```bash
   psql -h localhost -U postgres -d gitviz -f database/init.sql
   ```

3. **启动后端**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **启动前端**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 项目结构

```
gitviz/
├── frontend/                 # React 前端应用
│   ├── src/
│   │   ├── components/       # 通用组件
│   │   ├── pages/           # 页面组件
│   │   ├── store/           # Redux 状态管理
│   │   ├── services/        # API 服务
│   │   ├── types/           # TypeScript 类型定义
│   │   └── utils/           # 工具函数
│   └── package.json
├── backend/                  # Node.js 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由定义
│   │   ├── middleware/      # 中间件
│   │   ├── services/        # 业务逻辑
│   │   ├── config/          # 配置文件
│   │   └── utils/           # 工具函数
│   └── package.json
├── database/                # 数据库脚本
├── docs/                    # 项目文档
├── scripts/                 # 部署脚本
└── docker-compose.yml       # Docker 配置
```

## 开发指南

### 添加新功能

1. **前端功能**
   - 在 `src/types/` 中定义类型
   - 在 `src/services/` 中添加 API 调用
   - 在 `src/store/` 中更新状态管理
   - 在 `src/components/` 或 `src/pages/` 中实现 UI

2. **后端功能**
   - 在 `src/models/` 中定义数据模型
   - 在 `src/services/` 中实现业务逻辑
   - 在 `src/controllers/` 中处理请求
   - 在 `src/routes/` 中定义路由

### 数据库迁移

1. 创建新的迁移脚本
2. 更新 `database/init.sql`
3. 重启数据库服务

### 测试

```bash
# 前端测试
cd frontend
npm test

# 后端测试
cd backend
npm test
```

### 部署

```bash
# 构建生产环境
./scripts/build.sh

# 部署到生产环境
./scripts/deploy.sh
```

## API 文档

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/github` - GitHub 登录
- `GET /api/auth/me` - 获取当前用户信息

### 仓库接口

- `GET /api/repositories` - 获取仓库列表
- `POST /api/repositories` - 创建仓库
- `GET /api/repositories/:id` - 获取仓库详情
- `PUT /api/repositories/:id` - 更新仓库
- `DELETE /api/repositories/:id` - 删除仓库

### Git 操作接口

- `GET /api/git/repositories/:id/commits` - 获取提交历史
- `GET /api/git/repositories/:id/branches` - 获取分支列表
- `GET /api/git/repositories/:id/files` - 获取文件列表
- `POST /api/git/repositories/:id/branches` - 创建分支

## 环境变量配置

### 后端环境变量 (.env)

```env
# 服务器配置
PORT=8000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gitviz
DB_USER=postgres
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# GitHub OAuth配置
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 前端环境变量 (.env)

```env
# API配置
VITE_API_BASE_URL=http://localhost:8000/api

# GitHub OAuth配置
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_CLIENT_SECRET=your_github_client_secret
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 PostgreSQL 是否运行
   - 验证数据库连接参数
   - 确保数据库已创建

2. **前端无法访问后端 API**
   - 检查 CORS 配置
   - 验证 API 地址配置
   - 确保后端服务正在运行

3. **GitHub OAuth 失败**
   - 检查 GitHub OAuth 配置
   - 验证回调 URL 配置
   - 确保客户端 ID 和密钥正确

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License