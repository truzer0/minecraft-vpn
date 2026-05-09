import { Hono } from "hono";
import { authMiddleware } from "./middleware";
import { VpnService } from "./services/vpn-service";
import { query } from "./database";

const vpn = new Hono<{ Bindings: Env }>();
const vpnService = new VpnService();

vpn.use("*", authMiddleware);

// Получить VPN профиль
vpn.get("/profile", async (c) => {
  const userId = c.get("userId");
  
  try {
    // Проверяем существующий профиль
    const existingProfile = await query(
      `SELECT * FROM vpn_profiles 
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    
    let profile = existingProfile.rows[0];
    
    if (!profile) {
      // Создаем новый профиль через 3x-ui
      const config = await vpnService.generateClientConfig(userId);
      
      // Получаем созданный профиль из БД
      const newProfile = await query(
        `SELECT * FROM vpn_profiles WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      
      profile = newProfile.rows[0];
    } else {
      // Обновляем статистику
      const userResult = await query('SELECT email FROM users WHERE id = $1', [userId]);
      const stats = await vpnService.getUserStats(userResult.rows[0].email);
      
      if (stats) {
        profile = { ...profile, stats };
      }
    }
    
    // Генерируем ссылки для клиентов
    const config = profile.configuration;
    const links = {
      vless: `vless://${config.uuid}@${config.address}:${config.port}?encryption=none&security=reality&type=tcp&flow=xtls-rprx-vision&sni=${config.sni}&fp=${config.fp}&pbk=${config.pbk}&sid=${config.sid}#Nexus-VPN`,
      trojan: `trojan://${config.uuid}@${config.address}:8080?security=tls&type=tcp&sni=speedtest.net#Nexus-VPN-Trojan`,
      clash: this.generateClashConfig(config),
      singbox: this.generateSingboxConfig(config),
      outline: this.generateOutlineConfig(config)
    };
    
    return c.json({
      ...profile,
      links
    });
  } catch (error) {
    console.error("VPN profile error:", error);
    return c.json({ error: "Failed to get VPN profile" }, 500);
  }
});

// Генерация конфигов для разных клиентов
vpn.get("/config/:type", async (c) => {
  const userId = c.get("userId");
  const type = c.req.param("type");
  
  const profile = await query(
    `SELECT * FROM vpn_profiles WHERE user_id = $1 AND is_active = true`,
    [userId]
  );
  
  if (profile.rows.length === 0) {
    return c.json({ error: "VPN profile not found" }, 404);
  }
  
  const config = profile.rows[0].configuration;
  
  switch (type) {
    case "vless":
      return c.text(`vless://${config.uuid}@${config.address}:${config.port}?encryption=none&security=reality&type=tcp&flow=xtls-rprx-vision&sni=discord.com&fp=chrome&pbk=${config.pbk}&sid=6ba85179e30d4fc2#Nexus-VPN`);
    
    case "trojan":
      return c.text(`trojan://${config.uuid}@${config.address}:8080?security=tls&type=tcp&sni=speedtest.net#Nexus-VPN-Trojan`);
    
    case "clash":
      return c.text(this.generateClashConfig(config));
    
    case "singbox":
      return c.json(JSON.parse(this.generateSingboxConfig(config)));
    
    case "nekoray":
      return c.text(this.generateNekorayConfig(config));
    
    default:
      return c.json({ error: "Unknown config type" }, 400);
  }
});

// Получить статистику
vpn.get("/stats", async (c) => {
  const userId = c.get("userId");
  
  try {
    const userResult = await query('SELECT email FROM users WHERE id = $1', [userId]);
    const stats = await vpnService.getUserStats(userResult.rows[0].email);
    
    return c.json(stats);
  } catch (error) {
    console.error("VPN stats error:", error);
    return c.json({ error: "Failed to get stats" }, 500);
  }
});

export { vpn };