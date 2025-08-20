# GitViz API 文档

## 基础信息

- **基础URL**: `http://localhost:8000/api`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON

## 认证

### 用户注册
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

### 用户登录
```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

### GitHub 登录
```http
GET /auth/github
```

### 获取当前用户信息
```http
GET /auth/me
Authorization: Bearer <token>
```

## 仓库管理

### 获取仓库列表
```http
GET /repositories
Authorization: Bearer <token>
```

### 获取仓库详情
```http
GET /repositories/:id
Authorization: Bearer <token>
```

### 创建仓库
```http
POST /repositories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "url": "string"
}
```

### 更新仓库
```http
PUT /repositories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "url": "string",
  "isPrivate": boolean
}
```

### 删除仓库
```http
DELETE /repositories/:id
Authorization: Bearer <token>
```

### 克隆仓库
```http
POST /repositories/clone
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "string"
}
```

## Git 操作

### 获取提交历史
```http
GET /git/repositories/:id/commits?branch=main
Authorization: Bearer <token>
```

### 获取分支列表
```http
GET /git/repositories/:id/branches
Authorization: Bearer <token>
```

### 获取文件列表
```http
GET /git/repositories/:id/files?path=src
Authorization: Bearer <token>
```

### 获取文件内容
```http
GET /git/repositories/:id/files/path/to/file
Authorization: Bearer <token>
```

### 创建分支
```http
POST /git/repositories/:id/branches
Authorization: Bearer <token>
Content-Type: application/json

{
  "branchName": "string",
  "fromBranch": "string"
}
```

### 删除分支
```http
DELETE /git/repositories/:id/branches/:branchName
Authorization: Bearer <token>
```

### 合并分支
```http
POST /git/repositories/:id/merge
Authorization: Bearer <token>
Content-Type: application/json

{
  "sourceBranch": "string",
  "targetBranch": "string"
}
```

### 获取仓库统计
```http
GET /git/repositories/:id/stats
Authorization: Bearer <token>
```

## 响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误信息",
  "details": {}
}
```

## 状态码

- **200** - 成功
- **201** - 创建成功
- **400** - 请求错误
- **401** - 未授权
- **403** - 禁止访问
- **404** - 资源不存在
- **500** - 服务器错误

## 数据模型

### User
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "avatar": "string",
  "createdAt": "2023-01-01T00:00:00Z"
}
```

### Repository
```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "url": "string",
  "localPath": "string",
  "isPrivate": false,
  "userId": 1,
  "branchCount": 0,
  "commitCount": 0,
  "lastUpdated": "2023-01-01T00:00:00Z",
  "createdAt": "2023-01-01T00:00:00Z"
}
```

### Commit
```json
{
  "hash": "string",
  "message": "string",
  "author": "string",
  "email": "string",
  "date": "2023-01-01T00:00:00Z",
  "changes": {
    "additions": 0,
    "deletions": 0,
    "files": 0
  }
}
```

### Branch
```json
{
  "name": "string",
  "isCurrent": true,
  "commit": "string",
  "commitCount": 0
}
```

### FileItem
```json
{
  "path": "string",
  "name": "string",
  "type": "file|directory",
  "size": 0,
  "lastModified": "2023-01-01T00:00:00Z"
}
```