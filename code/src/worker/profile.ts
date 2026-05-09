import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "./middleware";
import { query, transaction } from "./database";

const profile = new Hono<{ Bindings: Env }>();

profile.use("*", authMiddleware);

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
});

const updatePreferencesSchema = z.object({
  language: z.string().optional(),
  theme: z.string().optional(),
  notifications_enabled: z.boolean().optional(),
  email_notifications: z.boolean().optional(),
});

// Get user profile with preferences
profile.get("/", async (c) => {
  const userId = c.get("userId");
  
  try {
    const result = await query(
      `SELECT u.*, up.language, up.theme, up.notifications_enabled, up.email_notifications
       FROM users u
       LEFT JOIN user_preferences up ON u.id = up.user_id
       WHERE u.id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }
    
    return c.json(result.rows[0]);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Update profile
profile.put("/", zValidator("json", updateProfileSchema), async (c) => {
  const userId = c.get("userId");
  const updates = c.req.valid("json");
  
  try {
    await transaction(async (client) => {
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      if (updates.name) {
        setClauses.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }
      
      if (updates.avatar) {
        setClauses.push(`avatar = $${paramCount++}`);
        values.push(updates.avatar);
      }
      
      if (setClauses.length > 0) {
        values.push(userId);
        await client.query(
          `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${paramCount}`,
          values
        );
        
        // Audit log
        await client.query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
           VALUES ($1, 'update_profile', 'user', $1, $2)`,
          [userId, JSON.stringify(updates)]
        );
      }
    });
    
    // Return updated user
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    return c.json(result.rows[0]);
  } catch (error) {
    console.error("Profile update error:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// Update preferences
profile.put("/preferences", zValidator("json", updatePreferencesSchema), async (c) => {
  const userId = c.get("userId");
  const preferences = c.req.valid("json");
  
  try {
    await query(
      `INSERT INTO user_preferences (user_id, language, theme, notifications_enabled, email_notifications)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         language = COALESCE($2, user_preferences.language),
         theme = COALESCE($3, user_preferences.theme),
         notifications_enabled = COALESCE($4, user_preferences.notifications_enabled),
         email_notifications = COALESCE($5, user_preferences.email_notifications),
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        preferences.language,
        preferences.theme,
        preferences.notifications_enabled,
        preferences.email_notifications,
      ]
    );
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Preferences update error:", error);
    return c.json({ error: "Failed to update preferences" }, 500);
  }
});

// Get user stats
profile.get("/stats", async (c) => {
  const userId = c.get("userId");
  
  try {
    const stats = await query(
      `SELECT 
        (SELECT COUNT(*) FROM minecraft_profiles WHERE user_id = $1) as minecraft_profiles,
        (SELECT COUNT(*) FROM vpn_profiles WHERE user_id = $1 AND is_active = true) as vpn_profiles,
        (SELECT COALESCE(SUM(data_usage), 0) FROM vpn_profiles WHERE user_id = $1) as total_bandwidth,
        u.created_at
       FROM users u
       WHERE u.id = $1`,
      [userId]
    );
    
    return c.json(stats.rows[0]);
  } catch (error) {
    console.error("Stats fetch error:", error);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

export { profile };