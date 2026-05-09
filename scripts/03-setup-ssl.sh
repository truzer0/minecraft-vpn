# scripts/03-setup-ssl.sh
#!/bin/bash
set -e

echo "========================================="
echo " Этап 3: Настройка SSL"
echo "========================================="

cd /opt/nexus

# Остановка nginx если запущен
systemctl stop nginx 2>/dev/null || true

# Получение сертификатов через Certbot
certbot certonly --standalone \
    -d nexus.ru \
    -d www.nexus.ru \
    --agree-tos \
    --email admin@nexus.ru \
    --non-interactive

# Копирование сертификатов
mkdir -p ssl
cp /etc/letsencrypt/live/nexus.ru/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/nexus.ru/privkey.pem ssl/key.pem

# Автообновление сертификатов
echo "0 3 * * * certbot renew --quiet --post-hook 'cp /etc/letsencrypt/live/nexus.ru/fullchain.pem /opt/nexus/ssl/cert.pem && cp /etc/letsencrypt/live/nexus.ru/privkey.pem /opt/nexus/ssl/key.pem && docker-compose restart frontend'" | crontab -

echo "✅ SSL сертификаты установлены"