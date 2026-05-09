# scripts/08-setup-frontend.sh
#!/bin/bash
set -e

echo "========================================="
echo " Этап 8: Настройка фронтенда"
echo "========================================="

cd /opt/nexus

# Копирование конфига nginx
cp nginx/nginx.conf nginx/default.conf

# Запуск фронтенда
docker-compose up -d frontend

# Проверка
sleep 5
curl -I https://localhost

echo "✅ Фронтенд настроен"