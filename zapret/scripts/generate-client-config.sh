#!/bin/bash

CLIENT_UUID=$(uuidgen)
SERVER_IP="85.215.132.23"

cat > client-config.json << EOF
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "tag": "socks",
      "port": 10808,
      "listen": "127.0.0.1",
      "protocol": "socks",
      "settings": {
        "udp": true
      }
    },
    {
      "tag": "http",
      "port": 10809,
      "listen": "127.0.0.1",
      "protocol": "http"
    }
  ],
  "outbounds": [
    {
      "tag": "proxy",
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "${SERVER_IP}",
            "port": 8443,
            "users": [
              {
                "id": "${CLIENT_UUID}",
                "encryption": "none",
                "flow": "xtls-rprx-vision"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "serverName": "discord.com",
          "fingerprint": "chrome",
          "publicKey": "SERVER_PUBLIC_KEY",
          "shortId": "6ba85179e30d4fc2"
        }
      }
    },
    {
      "tag": "direct",
      "protocol": "freedom"
    }
  ],
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "rules": [
      $(cat game-filter.json | jq '{rules: [.game_ports | to_entries[] | {type: "field", port: .value, outboundTag: "direct", network: "tcp,udp"}]}' | jq '.rules')
      {
        "type": "field",
        "domain": ["geosite:ru", "domain:yandex.ru", "domain:mail.ru", "domain:vk.com"],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "ip": ["geoip:ru", "geoip:private"],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "domain": ["geosite:telegram", "geosite:discord"],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "protocol": ["bittorrent"],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "port": "0-1023,25565,27015-27050",
        "outboundTag": "direct"
      }
    ]
  }
}
EOF

echo "✅ Client config generated: client-config.json"
echo "📋 Client UUID: ${CLIENT_UUID}"
echo "🔗 VPN Link: vless://${CLIENT_UUID}@${SERVER_IP}:8443?encryption=none&security=reality&type=tcp&flow=xtls-rprx-vision&sni=discord.com&fp=chrome&pbk=SERVER_PUBLIC_KEY&sid=6ba85179e30d4fc2#Nexus-VPN"