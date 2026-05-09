# scripts/00-prepare-server.sh
#!/bin/bash
set -e

echo "========================================="
echo " Этап 0: Подготовка сервера CentOS 9"
echo "========================================="

# Обновление системы
dnf update -y
dnf install -y epel-release
dnf config-manager --set-enabled crb

# Установка необходимых пакетов
dnf install -y \
    curl wget git vim htop net-tools \
    ca-certificates gnupg lsb-release \
    openssl openssh-server \
    tar gzip unzip \
    nginx certbot python3-certbot-nginx \
    fail2ban ufw \
    chrony

# Настройка времени
timedatectl set-timezone Europe/Moscow
systemctl enable --now chronyd

# Настройка firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 2053/tcp comment '3x-ui Panel'
ufw allow 8443/tcp comment 'VPN VLESS'
ufw allow 8080/tcp comment 'VPN Trojan'
ufw allow 25565/tcp comment 'Minecraft'
ufw allow 25575/tcp comment 'Minecraft RCON'
echo "y" | ufw enable

# Настройка fail2ban
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
logpath = /var/log/secure
EOF

systemctl enable --now fail2ban

# Оптимизация системы
cat >> /etc/sysctl.conf << EOF
# Network optimizations
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 10
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.tcp_keepalive_intvl = 15
net.ipv4.tcp_keepalive_probes = 5

# BBR
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr

# Memory
vm.swappiness = 10
vm.vfs_cache_pressure = 50

# File limits
fs.file-max = 100000
fs.inotify.max_user_watches = 524288
EOF

sysctl -p

# Лимиты
cat >> /etc/security/limits.conf << EOF
* soft nofile 100000
* hard nofile 100000
* soft nproc 32768
* hard nproc 32768
EOF

echo "✅ Этап 0 завершен"