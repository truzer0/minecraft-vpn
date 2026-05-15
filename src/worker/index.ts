import { createServer } from 'http';
import { parse } from 'url';
import * as crypto from 'crypto';
import { Pool } from 'pg';

const PORT = 8787;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://minecraft_vpn_user:kjT346bjTDF@postgres:5432/minecraft_vpn'
});

// AuthMe-совместимый SHA256 (без соли)
function hashPassword(p: string, legacy: boolean = false): string {
  if (legacy) {
    // Старый формат с солью (для переходного периода)
    return crypto.createHash('sha256').update(p + 'salt').digest('hex');
  }
  // Новый формат - чистый SHA256 как в AuthMe
  return crypto.createHash('sha256').update(p).digest('hex');
}

// Проверка пароля с поддержкой старых хешей
async function verifyPassword(plainPassword: string, storedHash: string, userId: string): Promise<boolean> {
  // Проверяем новый формат (AuthMe-совместимый)
  if (hashPassword(plainPassword) === storedHash) {
    return true;
  }
  
  // Проверяем старый формат (если не совпал новый)
  if (hashPassword(plainPassword, true) === storedHash) {
    // Автоматически обновляем на новый формат
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashPassword(plainPassword), userId]
    );
    console.log(`Migrated password hash for user ${userId} to new format`);
    return true;
  }
  
  return false;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function parseBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (c: string) => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

function CORS() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
}

async function getUser(req: any) {
  const t = req.headers.authorization?.replace('Bearer ', '');
  if (!t) return null;
  const r = await pool.query(
    'SELECT u.id, u.email, u.username FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.token = $1 AND s.expires_at > NOW()',
    [t]
  );
  return r.rows[0] || null;
}

const server = createServer(async (req, res) => {
  const { pathname: path } = parse(req.url || '', true);
  const m = req.method;

  if (m === 'OPTIONS') { res.writeHead(200, CORS()); res.end(); return; }

  try {
    // Health check
    if (path === '/api/health') {
      res.writeHead(200, CORS());
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    // Register
    if (path === '/api/auth/register' && m === 'POST') {
      const { email, password, username } = await parseBody(req);
      if (!email || !password || !username) {
        res.writeHead(400, CORS());
        res.end(JSON.stringify({ error: 'All fields required' }));
        return;
      }
      
      // Проверяем существование пользователя
      const ex = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
      if (ex.rows.length > 0) {
        res.writeHead(409, CORS());
        res.end(JSON.stringify({ error: 'User with this email or username exists' }));
        return;
      }
      
      // Создаем пользователя с новым форматом хеша
      const r = await pool.query(
        'INSERT INTO users (email, password_hash, username, realname, regdate, regip, world) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, username',
        [email, hashPassword(password), username, username, Math.floor(Date.now() / 1000), '0.0.0.0', 'world']
      );
      
      const user = r.rows[0];
      const token = generateToken();
      await pool.query(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
        [user.id, token]
      );
      
      res.writeHead(201, CORS());
      res.end(JSON.stringify({ user: { id: user.id, email: user.email, username: user.username }, token }));
      return;
    }

    // Login
    if (path === '/api/auth/login' && m === 'POST') {
      const { email, password } = await parseBody(req);
      if (!email || !password) {
        res.writeHead(400, CORS());
        res.end(JSON.stringify({ error: 'Email and password required' }));
        return;
      }
      
      const r = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (r.rows.length === 0) {
        res.writeHead(401, CORS());
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }
      
      const user = r.rows[0];
      const isValid = await verifyPassword(password, user.password_hash, user.id);
      
      if (!isValid) {
        res.writeHead(401, CORS());
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }
      
      const token = generateToken();
      await pool.query(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
        [user.id, token]
      );
      
      // Обновляем время последнего входа
      await pool.query(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP, lastlogin = EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::bigint WHERE id = $1',
        [user.id]
      );
      
      res.writeHead(200, CORS());
      res.end(JSON.stringify({ user: { id: user.id, email: user.email, username: user.username }, token }));
      return;
    }

    // Session
    if (path === '/api/auth/session' && m === 'GET') {
      const user = await getUser(req);
      res.writeHead(200, CORS());
      res.end(JSON.stringify({ user }));
      return;
    }

    // Change password
    if (path === "/api/auth/change-password" && m === "POST") {
      const user = await getUser(req);
      if (!user) { res.writeHead(401, CORS()); res.end(JSON.stringify({ error: "Auth required" })); return; }
      
      const { oldPassword, newPassword } = await parseBody(req);
      if (!oldPassword || !newPassword) {
        res.writeHead(400, CORS());
        res.end(JSON.stringify({ error: "Old and new passwords required" }));
        return;
      }
      
      const r = await pool.query("SELECT password_hash FROM users WHERE id = $1", [user.id]);
      const isValid = await verifyPassword(oldPassword, r.rows[0].password_hash, user.id);
      
      if (!isValid) {
        res.writeHead(400, CORS());
        res.end(JSON.stringify({ error: "Wrong password" }));
        return;
      }
      
      // Сохраняем новый пароль в AuthMe-совместимом формате
      await pool.query(
        "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [hashPassword(newPassword), user.id]
      );
      
      res.writeHead(200, CORS());
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // Logout
    if (path === '/api/auth/logout' && m === 'POST') {
      const t = req.headers.authorization?.replace('Bearer ', '');
      if (t) await pool.query('DELETE FROM sessions WHERE token = $1', [t]);
      res.writeHead(200, CORS());
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // Minecraft auth verify (для внешних проверок)
    if (path === "/api/minecraft/verify" && m === "POST") {
      const { username, password } = await parseBody(req);
      if (!username || !password) {
        res.writeHead(400, CORS());
        res.end(JSON.stringify({ error: 'Username and password required' }));
        return;
      }
      
      const result = await pool.query(
        "SELECT id, email, username FROM users WHERE (email = $1 OR username = $1) AND is_active = true",
        [username]
      );
      
      if (result.rows.length === 0) {
        res.writeHead(401, CORS());
        res.end(JSON.stringify({ allowed: false, error: 'User not found' }));
        return;
      }
      
      const user = result.rows[0];
      const userData = await pool.query("SELECT password_hash FROM users WHERE id = $1", [user.id]);
      const isValid = await verifyPassword(password, userData.rows[0].password_hash, user.id);
      
      if (isValid) {
        // Обновляем время последнего входа
        await pool.query(
          "UPDATE users SET last_login_at = CURRENT_TIMESTAMP, lastlogin = EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::bigint WHERE id = $1",
          [user.id]
        );
        
        res.writeHead(200, CORS());
        res.end(JSON.stringify({ allowed: true, username: user.username, email: user.email }));
      } else {
        res.writeHead(401, CORS());
        res.end(JSON.stringify({ allowed: false, error: 'Invalid password' }));
      }
      return;
    }

    // Telegram proxy
    if (path === '/api/vpn/telegram-proxy' && m === 'GET') {
      const user = await getUser(req);
      if (!user) { res.writeHead(401, CORS()); res.end(JSON.stringify({ error: 'Auth required' })); return; }
      res.writeHead(200, CORS());
      res.end(JSON.stringify({
        server: '153.80.251.181',
        port: 2080,
        type: 'socks5',
        tg_link: 'tg://socks?server=153.80.251.181&port=2080'
      }));
      return;
    }

    // VPN profile
    if (path === '/api/vpn/profile' && m === 'GET') {
      const user = await getUser(req);
      if (!user) { res.writeHead(401, CORS()); res.end(JSON.stringify({ error: 'Auth required' })); return; }
      res.writeHead(200, CORS());
      res.end(JSON.stringify({
        vpn_link: 'vless://your-uuid@153.80.251.181:8443?encryption=none&security=reality&type=tcp&flow=xtls-rprx-vision&sni=discord.com&fp=chrome#Minecraft-VPN',
        server: '153.80.251.181',
        port: 8443,
        protocol: 'vless'
      }));
      return;
    }

    // Minecraft profile
    if (path === '/api/minecraft/profile' && m === 'GET') {
      const user = await getUser(req);
      if (!user) { res.writeHead(401, CORS()); res.end(JSON.stringify({ error: 'Auth required' })); return; }
      res.writeHead(200, CORS());
      res.end(JSON.stringify({
        server_ip: '153.80.251.181',
        port: 25565,
        version: '1.21.4',
        mods: 'Paper + Plugins'
      }));
      return;
    }

    // Minecraft server stats
    if (path === '/api/minecraft/server-stats' && m === 'GET') {
      try {
        const stats = await pool.query(`
          SELECT 
            COUNT(*) as total_players,
            COUNT(CASE WHEN lastlogin > EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '1 day')::bigint THEN 1 END) as active_today,
            COUNT(CASE WHEN lastlogin > EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '7 days')::bigint THEN 1 END) as active_week,
            COUNT(CASE WHEN islogged = 1 THEN 1 END) as players_online
          FROM users
        `);
        
        res.writeHead(200, CORS());
        res.end(JSON.stringify({
          total_players: parseInt(stats.rows[0].total_players) || 0,
          active_today: parseInt(stats.rows[0].active_today) || 0,
          active_week: parseInt(stats.rows[0].active_week) || 0,
          total_hours_played: 0,
          tps: '20.0',
          players_online: stats.rows[0].players_online?.toString() || '0'
        }));
      } catch (e) {
        console.error('Error fetching stats:', e);
        res.writeHead(200, CORS());
        res.end(JSON.stringify({
          total_players: 0,
          active_today: 0,
          active_week: 0,
          total_hours_played: 0,
          tps: '20.0',
          players_online: '0'
        }));
      }
      return;
    }

    res.writeHead(404, CORS());
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (e) {
    console.error(e);
    res.writeHead(500, CORS());
    res.end(JSON.stringify({ error: 'Server error' }));
  }
});

server.listen(PORT, '0.0.0.0', () => console.log('Server on port', PORT));
