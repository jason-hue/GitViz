#!/bin/bash

echo "🚀 启动 GitViz 开发环境..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建.env文件如果不存在
if [ ! -f backend/.env ]; then
    echo "📝 创建后端环境配置文件..."
    cp backend/.env.example backend/.env
    echo "⚠️  请编辑 backend/.env 文件，配置正确的数据库密码和GitHub OAuth信息"
fi

if [ ! -f frontend/.env ]; then
    echo "📝 创建前端环境配置文件..."
    cp frontend/.env.example frontend/.env
fi

# 启动服务
echo "🐳 启动 Docker 容器..."
docker-compose up -d

echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

echo "✅ 开发环境启动完成！"
echo ""
echo "🌐 前端地址: http://localhost:3000"
echo "🔗 后端API: http://localhost:8000"
echo "📊 健康检查: http://localhost:8000/health"
echo ""
echo "📝 注意事项:"
echo "1. 请确保配置了正确的GitHub OAuth信息"
echo "2. 默认管理员账户: admin@example.com / password"
echo "3. 使用 'docker-compose logs -f' 查看日志"
echo "4. 使用 'docker-compose down' 停止服务"