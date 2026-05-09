# scripts/02-setup-project.sh
#!/bin/bash
set -e

echo "========================================="
echo " Этап 2: Настройка проекта"
echo "========================================="

# Создание структуры директорий
mkdir -p /opt/nexus
cd /opt/nexus

# Клонирование репозитория (или создание структуры)
git clone https://github.com/your-repo/nexus.git . || mkdir -p /opt/nexus

# Создание необходимых директорий
mkdir -p {
    database,
    database/migrations,
    minecraft_data,
    minecraft/mods,
    minecraft/config,
    minecraft/plugins/EasyAuth,
    minecraft/shaders,
    minecraft/resourcepacks,
    3x-ui/{db,cert,config,custom-routing},
    zapret/{config,scripts,logs,ipset},
    ssl,
    backups,
    scripts,
    nginx,
    logs
}

# Настройка прав
chown -R $USER:$USER /opt/nexus
chmod -R 755 /opt/nexus/scripts

# Копирование .env файла
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Отредактируйте .env файл!"
fi

echo "✅ Структура проекта создана"