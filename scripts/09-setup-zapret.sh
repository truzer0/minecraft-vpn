# scripts/09-setup-zapret.sh
#!/bin/bash
set -e

echo "========================================="
echo " Этап 9: Настройка Zapret"
echo "========================================="

cd /opt/nexus

# Запуск zapret
docker-compose up -d zapret

# Проверка
sleep 5
docker-compose logs zapret

echo "✅ Zapret настроен"