#!/bin/bash

echo "🧪 测试注册功能..."

# 等待后端启动
echo "⏳ 等待后端启动..."
sleep 10

# 测试后端健康检查
echo "🔍 测试后端健康检查..."
curl -s http://localhost:8000/health || echo "❌ 后端健康检查失败"

# 测试注册API
echo ""
echo "📝 测试注册API..."
response=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass"}')

echo "响应: $response"

# 测试通过前端代理的注册API
echo ""
echo "🌐 测试通过前端代理的注册API..."
response2=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","email":"test2@example.com","password":"testpass"}')

echo "响应: $response2"