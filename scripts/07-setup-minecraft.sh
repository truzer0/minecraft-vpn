# scripts/07-setup-minecraft.sh
#!/bin/bash
set -e

echo "========================================="
echo " Этап 7: Настройка Minecraft"
echo "========================================="

cd /opt/nexus

# Создание директорий
mkdir -p minecraft_data minecraft/mods minecraft/config minecraft/plugins/EasyAuth

# Загрузка модов
chmod +x scripts/download-mods.sh
./scripts/download-mods.sh

# Настройка прав
chown -R 1000:1000 minecraft_data

# Первый запуск для генерации конфигов
docker-compose up -d minecraft
sleep 10

# Принятие EULA
echo "eula=true" > minecraft_data/eula.txt

# Перезапуск
docker-compose restart minecraft

echo "✅ Minecraft сервер настроен"