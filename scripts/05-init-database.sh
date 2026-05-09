# scripts/05-init-database.sh
#!/bin/bash
set -e

echo "========================================="
echo " Этап 5: Инициализация базы данных"
echo "========================================="

cd /opt/nexus

# Запуск PostgreSQL
docker-compose up -d postgres
sleep 10

# Применение миграций
docker-compose exec -T postgres psql -U nexus_user -d nexus < database/init.sql

# Применение дополнительных миграций
for migration in database/migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "Applying migration: $migration"
        docker-compose exec -T postgres psql -U nexus_user -d nexus < "$migration"
    fi
done

echo "✅ База данных инициализирована"