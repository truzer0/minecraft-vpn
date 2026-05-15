import { query } from "../database";

interface XUIClient {
  id: number;
  email: string;
  uuid: string;
  enable: boolean;
  expiryTime: number;
  up: number;
  down: number;
  total: number;
}

interface VpnConfig {
  protocol: 'vless' | 'trojan' | 'vmess';
  address: string;
  port: number;
  uuid: string;
  type: string;
  security: string;
  sni: string;
  fp: string;
  pbk: string;
  sid: string;
  flow: string;
}

export class VpnService {
  private xuiApiUrl: string;
  private xuiUsername: string;
  private xuiPassword: string;
  private sessionCookie: string | null = null;

  constructor() {
    this.xuiApiUrl = `http://127.0.0.1:${process.env.XUI_PORT || 2053}`;
    this.xuiUsername = process.env.XUI_USERNAME || 'admin';
    this.xuiPassword = process.env.XUI_PASSWORD || 'admin';
  }

  // Авторизация в 3x-ui API
  private async login(): Promise<string> {
    if (this.sessionCookie) {
      return this.sessionCookie;
    }

    try {
      const response = await fetch(`${this.xuiApiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.xuiUsername,
          password: this.xuiPassword
        })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      this.sessionCookie = response.headers.get('set-cookie') || '';
      return this.sessionCookie;
    } catch (error) {
      console.error('XUI Login error:', error);
      throw error;
    }
  }

  // Получить список inbound'ов
  async getInbounds() {
    await this.login();
    
    const response = await fetch(`${this.xuiApiUrl}/panel/api/inbounds/list`, {
      headers: {
        'Cookie': this.sessionCookie!
      }
    });

    return response.json();
  }

  // Создать клиента
  async addClient(inboundId: number, email: string, uuid: string): Promise<any> {
    await this.login();

    const response = await fetch(
      `${this.xuiApiUrl}/panel/api/inbounds/addClient`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.sessionCookie!
        },
        body: JSON.stringify({
          id: inboundId,
          settings: JSON.stringify({
            clients: [{
              id: uuid,
              email: email,
              enable: true,
              flow: "xtls-rprx-vision",
              limitIp: 0,
              totalGB: 0,
              expiryTime: 0
            }]
          })
        })
      }
    );

    return response.json();
  }

  // Получить клиента
  async getClient(email: string): Promise<XUIClient | null> {
    await this.login();

    const response = await fetch(`${this.xuiApiUrl}/panel/api/inbounds/list`, {
      headers: { 'Cookie': this.sessionCookie! }
    });

    const data = await response.json();
    
    for (const inbound of data.obj) {
      const settings = JSON.parse(inbound.settings);
      if (settings.clients) {
        const client = settings.clients.find((c: any) => c.email === email);
        if (client) return client;
      }
    }

    return null;
  }

  // Сгенерировать конфиг для клиента
  async generateClientConfig(userId: string, protocol: 'vless' | 'trojan' = 'vless'): Promise<VpnConfig> {
    // Получаем пользователя из БД
    const user = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) {
      throw new Error('User not found');
    }

    const email = user.rows[0].email;
    let client = await this.getClient(email);

    // Если клиент не существует, создаем
    if (!client) {
      const uuid = crypto.randomUUID();
      await this.addClient(1, email, uuid); // 1 - ID инбаунда VLESS
      client = await this.getClient(email);
    }

    // Генерируем конфиг
    const config: VpnConfig = {
      protocol: 'vless',
      address: process.env.APP_URL || '153.80.251.181',
      port: 8443,
      uuid: client!.id,
      type: 'tcp',
      security: 'reality',
      sni: 'discord.com',
      fp: 'chrome',
      pbk: 'YOUR_PUBLIC_KEY',
      sid: '6ba85179e30d4fc2',
      flow: 'xtls-rprx-vision'
    };

    // Сохраняем конфиг в БД
    await query(
      `INSERT INTO vpn_profiles (user_id, profile_name, profile_url, protocol, configuration)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         profile_url = $3,
         configuration = $5,
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        `VPN-${protocol}`,
        `vless://${config.uuid}@${config.address}:${config.port}?encryption=none&security=reality&type=tcp&flow=xtls-rprx-vision&sni=${config.sni}&fp=${config.fp}&pbk=${config.pbk}&sid=${config.sid}#Nexus-VPN`,
        protocol,
        JSON.stringify(config)
      ]
    );

    return config;
  }

  // Получить статистику пользователя
  async getUserStats(email: string) {
    const client = await this.getClient(email);
    if (!client) return null;

    return {
      upload: client.up,
      download: client.down,
      total: client.total,
      enabled: client.enable,
      expiryTime: client.expiryTime
    };
  }
}