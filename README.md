# 🎮 Minecraft VPN Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![CentOS](https://img.shields.io/badge/CentOS-9%20Stream-green.svg)](https://www.centos.org/)

**Minecraft-VPN.com** — единая платформа для игр и безопасного доступа в интернет.

## 🌟 Возможности

### 🎮 Minecraft Сервер
- **Forge 1.20.4** с 30+ модами
- Tinkers Construct, Immersive Portals, TerraForged
- Pam's HarvestCraft, JourneyMap, JEI
- Привязка аккаунта к сайту через EasyAuth
- Автоматическая выдача прав через LuckPerms
- Whitelist только для авторизованных

### 🔐 Умный VPN (3x-ui)
- **VLESS Reality** — недетектируемый протокол
- **Trojan TLS** — запасной протокол
- **Zapret** — обход DPI для Telegram/Discord
- **Game Filter** — игры без VPN (прямой IP)
- **Каскадный VPN** — РФ → Европа для зарубежных сайтов
- Telegram прокси (MTProto/SOCKS5/HTTP)

### 🌐 Сайт
- Авторизация через Google OAuth2
- Управление профилем
- Привязка Minecraft аккаунта
- Генерация VPN конфигов
- Статистика использования

## 🏗️ Технологический стек

| Компонент | Технология |
|-----------|------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Radix UI |
| **Backend** | Hono, Node.js, TypeScript |
| **База данных** | PostgreSQL 16 |
| **Кэширование** | Redis 7 |
| **VPN** | 3x-ui (Xray), Zapret |
| **Minecraft** | Forge 1.20.4, EasyAuth |
| **Деплой** | Docker, Docker Compose |
| **ОС** | CentOS 9 Stream |

## 📋 Системные требования

| Ресурс | Минимально | Рекомендуется |
|--------|------------|---------------|
| **CPU** | 2 ядра | 4+ ядер |
| **RAM** | 4 GB | 8+ GB |
| **Диск** | 40 GB SSD | 80+ GB NVMe |
| **Сеть** | 100 Mbps | 1 Gbps |

## 🚀 Быстрая установка

### На CentOS 9 Stream:

```bash
# Одна команда для установки
curl -sSL https://raw.githubusercontent.com/your-username/minecraft-vpn/main/install.sh | sudo bash