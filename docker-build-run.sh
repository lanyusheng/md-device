#!/bin/bash

# 配置
IMAGE_NAME="md-device"
CONTAINER_NAME="md-device-app"
PORT=3000

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  MD Device Docker 构建与运行脚本${NC}"
echo -e "${GREEN}======================================${NC}"

# 停止并删除旧容器
echo -e "\n${YELLOW}[1/4] 停止并删除旧容器...${NC}"
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    docker stop $CONTAINER_NAME 2>/dev/null
    docker rm $CONTAINER_NAME 2>/dev/null
    echo "已删除旧容器"
else
    echo "没有运行中的容器"
fi

# 清理旧镜像（可选）
echo -e "\n${YELLOW}[2/4] 清理悬空镜像...${NC}"
docker image prune -f

# 检查并复制环境变量文件
echo -e "\n${YELLOW}检查环境变量文件...${NC}"
if [ ! -f .env.local ]; then
  if [ -f .env.example ]; then
    echo "复制 .env.example 到 .env.local"
    cp .env.example .env.local
  else
    echo -e "${RED}警告: 未找到 .env.example 或 .env.local 文件${NC}"
  fi
else
  echo ".env.local 已存在，使用现有配置"
fi

# 构建新镜像
echo -e "\n${YELLOW}[3/4] 构建 Docker 镜像...${NC}"
docker build -t $IMAGE_NAME:latest .

if [ $? -ne 0 ]; then
    echo -e "\n${RED}构建失败！请检查错误信息。${NC}"
    exit 1
fi

# 启动容器
echo -e "\n${YELLOW}[4/4] 启动容器...${NC}"
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:$PORT \
  -e NODE_ENV=production \
  -e PORT=$PORT \
  --restart unless-stopped \
  $IMAGE_NAME:latest

if [ $? -ne 0 ]; then
    echo -e "\n${RED}启动失败！请检查错误信息。${NC}"
    exit 1
fi

# 等待容器启动
echo -e "\n${GREEN}等待容器启动...${NC}"
sleep 3

# 显示容器状态
echo -e "\n${GREEN}容器状态：${NC}"
docker ps -f name=$CONTAINER_NAME

# 显示日志
echo -e "\n${GREEN}======================================${NC}"
echo -e "${GREEN}  应用已启动！${NC}"
echo -e "${GREEN}  访问地址: http://localhost:$PORT${NC}"
echo -e "${GREEN}======================================${NC}"

echo -e "\n${YELLOW}查看实时日志：${NC}"
echo -e "  docker logs -f $CONTAINER_NAME\n"

echo -e "${YELLOW}停止容器：${NC}"
echo -e "  docker stop $CONTAINER_NAME\n"

echo -e "${YELLOW}删除容器：${NC}"
echo -e "  docker rm $CONTAINER_NAME\n"

# 询问是否查看日志
read -p "是否现在查看实时日志？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker logs -f $CONTAINER_NAME
fi
