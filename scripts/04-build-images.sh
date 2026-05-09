# scripts/04-build-images.sh
#!/bin/bash
set -e

echo "========================================="
echo " Этап 4: Сборка Docker образов"
echo "========================================="

cd /opt/nexus

# Сборка основного приложения
docker-compose build app

# Сборка фронтенда
docker-compose build frontend

# Сборка zapret
docker-compose build zapret

# Загрузка образов 3x-ui и Minecraft
docker pull ghcr.io/mhsanaei/3x-ui:latest
docker pull itzg/minecraft-server:java17-alpine
docker pull postgres:16-alpine
docker pull redis:7-alpine

echo "✅ Образы собраны"