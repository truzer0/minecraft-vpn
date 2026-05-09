#!/bin/sh

echo "Starting Zapret DPI bypass..."

# Включаем IP форвардинг
echo 1 > /proc/sys/net/ipv4/ip_forward
echo 1 > /proc/sys/net/ipv4/conf/all/forwarding

# Настраиваем ipset для быстрой фильтрации
ipset create zapret-hosts hash:net -exist
ipset create zapret-ports bitmap:port range 1-65535 -exist

# Загружаем подсети из файла
while IFS= read -r line; do
    [ -z "$line" ] && continue
    [[ "$line" =~ ^# ]] && continue
    ipset add zapret-hosts "$line" -exist 2>/dev/null
done < /opt/zapret/config/ipset/zapret-hosts.txt

# Загружаем порты
for port in 443 8443 5222 5223 5228 5229 5230; do
    ipset add zapret-ports "$port" -exist
done

# Запускаем zapret
cd /opt/zapret
./install_bin.sh
./install_prereq.sh
./blockcheck.sh

# Запускаем основной процесс
exec /opt/zapret/tpws --user=root --daemon \
    --port=443,8443 \
    --hostlist=/opt/zapret/config/ipset/zapret-hosts.txt \
    --hostspell=HOST \
    --split-pos=1 \
    --daemon-uid=65534 \
    --pidfile=/opt/zapret/logs/tpws.pid