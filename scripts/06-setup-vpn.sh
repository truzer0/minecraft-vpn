# scripts/06-setup-vpn.sh
#!/bin/bash
set -e

echo "========================================="
echo " Этап 6: Настройка 3x-ui VPN"
echo "========================================="

cd /opt/nexus

# Генерация ключей Reality
mkdir -p 3x-ui/cert
openssl genpkey -algorithm X25519 -out 3x-ui/cert/private.key
openssl pkey -in 3x-ui/cert/private.key -pubout -out 3x-ui/cert/public.key

PRIVATE_KEY=$(cat 3x-ui/cert/private.key)
PUBLIC_KEY=$(cat 3x-ui/cert/public.key)

echo "Private Key: $PRIVATE_KEY"
echo "Public Key: $PUBLIC_KEY"

# Сохранение ключей в .env
echo "REALITY_PRIVATE_KEY=$PRIVATE_KEY" >> .env
echo "REALITY_PUBLIC_KEY=$PUBLIC_KEY" >> .env

# Копирование конфига
cp 3x-ui/config/config.json 3x-ui/db/config.json

# Запуск 3x-ui
docker-compose up -d 3x-ui
sleep 5

echo "✅ 3x-ui настроен"
echo "🌐 Панель доступна на порту 2053"