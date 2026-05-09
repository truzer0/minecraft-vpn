import { Hono } from "hono";
import { authMiddleware } from "./middleware";
import { query, transaction } from "./database";
import { Rcon } from "rcon-client";

const minecraftAPI = new Hono<{ Bindings: Env }>();

// RCON подключение
async function rconCommand(command: string): Promise<string> {
  const rcon = await Rcon.connect({
    host: process.env.MC_RCON_HOST || "minecraft",
    port: parseInt(process.env.MC_RCON_PORT || "25575"),
    password: process.env.MC_RCON_PASSWORD || "",
  });
  
  try {
    const response = await rcon.send(command);
    return response;
  } finally {
    rcon.end();
  }
}

// Привязка Minecraft аккаунта
minecraftAPI.post("/link", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const { minecraft_username, minecraft_uuid } = await c.req.json();
  
  try {
    // Проверяем, не привязан ли уже аккаунт
    const existing = await query(
      `SELECT * FROM minecraft_accounts 
       WHERE user_id = $1 OR minecraft_username = $2 OR minecraft_uuid = $3`,
      [userId, minecraft_username, minecraft_uuid]
    );
    
    if (existing.rows.length > 0) {
      return c.json({ error: "Аккаунт уже привязан" }, 409);
    }
    
    // Привязываем аккаунт
    const result = await query(
      `INSERT INTO minecraft_accounts (user_id, minecraft_uuid, minecraft_username)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, minecraft_uuid, minecraft_username]
    );
    
    // Выдаем базовые права через LuckPerms
    await rconCommand(`lp user ${minecraft_username} parent set default`);
    
    // Добавляем в whitelist
    await rconCommand(`whitelist add ${minecraft_username}`);
    
    return c.json({ 
      success: true, 
      account: result.rows[0] 
    });
  } catch (error) {
    console.error("Link account error:", error);
    return c.json({ error: "Ошибка привязки аккаунта" }, 500);
  }
});

// Получить Minecraft профиль пользователя
minecraftAPI.get("/profile", authMiddleware, async (c) => {
  const userId = c.get("userId");
  
  try {
    const result = await query(
      `SELECT ma.*, ms.*
       FROM minecraft_accounts ma
       LEFT JOIN minecraft_stats ms ON ma.id = ms.account_id
       WHERE ma.user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return c.json({ error: "Minecraft аккаунт не найден" }, 404);
    }
    
    // Получаем онлайн статус через RCON
    const account = result.rows[0];
    let isOnline = false;
    
    try {
      const listResponse = await rconCommand("list");
      isOnline = listResponse.includes(account.minecraft_username);
    } catch (error) {
      // Игнорируем ошибку RCON
    }
    
    return c.json({
      ...account,
      is_online: isOnline
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return c.json({ error: "Ошибка получения профиля" }, 500);
  }
});

// Выдать права игроку
minecraftAPI.post("/permissions", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const { permission, value = true, world } = await c.req.json();
  
  try {
    const account = await query(
      "SELECT * FROM minecraft_accounts WHERE user_id = $1",
      [userId]
    );
    
    if (account.rows.length === 0) {
      return c.json({ error: "Minecraft аккаунт не привязан" }, 404);
    }
    
    // Выдаем право через LuckPerms
    const command = world 
      ? `lp user ${account.rows[0].minecraft_username} permission set ${permission} ${value} world=${world}`
      : `lp user ${account.rows[0].minecraft_username} permission set ${permission} ${value}`;
    
    await rconCommand(command);
    
    // Сохраняем в БД
    await query(
      `INSERT INTO minecraft_permissions (account_id, permission_node, value, world)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (account_id, permission_node, world) 
       DO UPDATE SET value = $3`,
      [account.rows[0].id, permission, value, world]
    );
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Set permission error:", error);
    return c.json({ error: "Ошибка выдачи права" }, 500);
  }
});

// Получить статистику сервера
minecraftAPI.get("/server-stats", async (c) => {
  try {
    // Получаем информацию о сервере через RCON
    const [tpsResponse, listResponse] = await Promise.all([
      rconCommand("tps"),
      rconCommand("list")
    ]);
    
    // Получаем статистику из БД
    const stats = await query(`
      SELECT 
        COUNT(DISTINCT ma.id) as total_players,
        COUNT(DISTINCT CASE WHEN ms.last_login_at > NOW() - INTERVAL '24 hours' THEN ma.id END) as active_today,
        COUNT(DISTINCT CASE WHEN ms.last_login_at > NOW() - INTERVAL '7 days' THEN ma.id END) as active_week,
        SUM(ms.play_time) / 60 as total_hours_played
      FROM minecraft_accounts ma
      LEFT JOIN minecraft_stats ms ON ma.id = ms.account_id
    `);
    
    return c.json({
      ...stats.rows[0],
      tps: tpsResponse,
      players_online: listResponse
    });
  } catch (error) {
    console.error("Server stats error:", error);
    return c.json({ error: "Ошибка получения статистики" }, 500);
  }
});

export { minecraftAPI };