import { Hono } from "hono";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { query, transaction } from "./database";

const auth = new Hono<{ Bindings: Env }>();

// User repository
class UserRepository {
  async findByGoogleId(googleId: string) {
    const result = await query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    return result.rows[0];
  }

  async createOrUpdate(userData: any) {
    const result = await query(
      `INSERT INTO users (google_id, email, name, avatar) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (google_id) 
       DO UPDATE SET 
         email = $2,
         name = $3,
         avatar = $4,
         updated_at = CURRENT_TIMESTAMP,
         last_login_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userData.google_id, userData.email, userData.name, userData.avatar]
    );
    return result.rows[0];
  }

  async createSession(userId: string, ipAddress?: string, userAgent?: string) {
    const token = crypto.randomUUID();
    const result = await query(
      `INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + INTERVAL '7 days')
       RETURNING *`,
      [userId, token, ipAddress, userAgent]
    );
    return result.rows[0];
  }

  async getSessionByToken(token: string) {
    const result = await query(
      `SELECT s.*, u.email, u.name, u.avatar, u.role
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 
         AND s.expires_at > CURRENT_TIMESTAMP 
         AND s.is_valid = true`,
      [token]
    );
    return result.rows[0];
  }

  async invalidateSession(token: string) {
    await query(
      'UPDATE sessions SET is_valid = false WHERE token = $1',
      [token]
    );
  }
}

const userRepo = new UserRepository();

// Google OAuth endpoints
auth.get("/google", async (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${c.env.APP_URL}/api/auth/google/callback`;
  
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  
  return c.redirect(url.toString());
});

// Google OAuth callback
auth.get("/google/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) {
    return c.json({ error: "No code provided" }, 400);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${c.env.APP_URL}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokens: any = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo: any = await userInfoResponse.json();

    // Create or update user in database
    const user = await userRepo.createOrUpdate({
      google_id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.picture,
    });

    // Get IP and User Agent for session
    const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';

    // Create session
    const session = await userRepo.createSession(user.id, ipAddress, userAgent);

    // Store refresh token if available
    if (tokens.refresh_token) {
      await query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at) 
         VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '30 days')`,
        [user.id, tokens.refresh_token]
      );
    }

    // Set session cookie
    setCookie(c, "session", session.token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Log the action
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, ip_address, user_agent)
       VALUES ($1, 'login', 'user', $2, $3)`,
      [user.id, ipAddress, userAgent]
    );

    return c.redirect(`${c.env.APP_URL}/profile`);
  } catch (error) {
    console.error("Auth error:", error);
    return c.redirect(`${c.env.APP_URL}/?error=auth_failed`);
  }
});

// Get current session
auth.get("/session", async (c) => {
  const sessionToken = getCookie(c, "session");
  
  if (!sessionToken) {
    return c.json({ user: null });
  }

  try {
    const session = await userRepo.getSessionByToken(sessionToken);
    
    if (!session) {
      deleteCookie(c, "session");
      return c.json({ user: null });
    }

    return c.json({ 
      user: {
        id: session.user_id,
        email: session.email,
        name: session.name,
        avatar: session.avatar,
        role: session.role,
      }
    });
  } catch (error) {
    console.error("Session check error:", error);
    return c.json({ user: null }, 500);
  }
});

// Logout
auth.post("/logout", async (c) => {
  const sessionToken = getCookie(c, "session");
  
  if (sessionToken) {
    try {
      // Invalidate session
      await userRepo.invalidateSession(sessionToken);
      
      // Get user info for audit log
      const session = await userRepo.getSessionByToken(sessionToken);
      if (session) {
        await query(
          `INSERT INTO audit_logs (user_id, action, entity_type)
           VALUES ($1, 'logout', 'user')`,
          [session.user_id]
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    deleteCookie(c, "session");
  }
  
  return c.json({ success: true });
});

export { auth };