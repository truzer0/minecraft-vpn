import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { query } from "./database";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function authMiddleware(c: Context, next: Next) {
  const sessionToken = getCookie(c, "session");
  
  if (!sessionToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  try {
    const result = await query(
      `SELECT u.id, u.email, u.name, u.role
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 
         AND s.expires_at > CURRENT_TIMESTAMP 
         AND s.is_valid = true`,
      [sessionToken]
    );
    
    if (result.rows.length === 0) {
      return c.json({ error: "Session expired" }, 401);
    }
    
    const user = result.rows[0];
    c.set("user", user);
    c.set("userId", user.id);
    c.set("userRole", user.role);
    
    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

export async function adminMiddleware(c: Context, next: Next) {
  const userRole = c.get("userRole");
  
  if (userRole !== 'admin') {
    return c.json({ error: "Forbidden" }, 403);
  }
  
  await next();
}