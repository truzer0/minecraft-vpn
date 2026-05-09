# scripts/01-install-docker.sh
#!/bin/bash
set -e

echo "========================================="
echo " Этап 1: Установка Docker"
echo "========================================="

# Удаление старых версий
dnf remove -y docker docker-client docker-client-latest docker-common \
    docker-latest docker-latest-logrotate docker-logrotate docker-engine

# Установка Docker
dnf install -y dnf-plugins-core
dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Запуск Docker
systemctl enable --now docker

# Добавление пользователя в группу docker
usermod -aG docker $USER

# Установка Docker Compose отдельно (если нужно)
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Проверка
docker --version
docker-compose --version

echo "✅ Docker установлен"