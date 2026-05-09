# scripts/10-final-start.sh
#!/bin/bash
set -e

echo "========================================="
echo " Этап 10: Финальный запуск"
echo "========================================="

cd /opt/nexus

# Остановка всех сервисов
docker-compose down

# Запуск всех сервисов
docker-compose up -d

# Ожидание запуска
echo "Ожидание запуска сервисов..."
sleep 30

# Проверка статуса
echo ""
echo "========================================="
echo " Статус сервисов:"
echo "========================================="
docker-compose ps

echo ""
echo "========================================="
echo " Проверка доступности:"
echo "========================================="

# Проверка сайта
echo -n "Сайт (HTTP): "
curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "недоступен"
echo ""

echo -n "Сайт (HTTPS): "
curl -s -o /dev/null -w "%{http_code}" https://localhost || echo "недоступен"
echo ""

# Проверка API
echo -n "API: "
curl -s -o /dev/null -w "%{http_code}" http://localhost/api/auth/session || echo "недоступен"
echo ""

# Проверка Minecraft
echo -n "Minecraft (25565): "
timeout 3 bash -c 'echo > /dev/tcp/localhost/25565' && echo "доступен" || echo "недоступен"

# Проверка 3x-ui
echo -n "3x-ui Panel (2053): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:2053 || echo "недоступен"
echo ""

echo ""
echo "========================================="
echo " ✅ Nexus Platform запущена!"
echo "========================================="
echo ""
echo "🌐 Сайт: https://nexus.ru"
echo "🎮 Minecraft: nexus.ru:25565"
echo "🔐 3x-ui Panel: https://nexus.ru:2053"
echo ""
echo "📊 Использование ресурсов:"
free -h
echo ""
df -h /
echo ""
echo "Для просмотра логов: docker-compose logs -f"