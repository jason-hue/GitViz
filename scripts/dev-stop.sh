#!/bin/bash

echo "🛑 停止 GitViz 开发环境..."

# 停止所有服务
docker-compose down

# 可选：清理 volumes（取消注释以清理数据）
# docker-compose down -v

echo "✅ 开发环境已停止"