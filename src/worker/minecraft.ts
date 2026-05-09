import { Hono } from "hono";
import { authMiddleware } from "./middleware";

const minecraft = new Hono<{ Bindings: Env }>();

// All routes require authentication
minecraft.use("*", authMiddleware);

// Get user's Minecraft profile
minecraft.get("/profile", async (c) => {
  const userId = c.get("userId");
  
  let profile = await c.env.DB.prepare(
    "SELECT * FROM minecraft_profiles WHERE user_id = ?"
  ).bind(userId).first();

  // Create profile if doesn't exist
  if (!profile) {
    const result = await c.env.DB.prepare(
      "INSERT INTO minecraft_profiles (user_id, server_ip) VALUES (?, ?)"
    ).bind(userId, c.env.MINECRAFT_SERVER_IP || "85.215.132.23").run();
    
    profile = await c.env.DB.prepare(
      "SELECT * FROM minecraft_profiles WHERE user_id = ?"
    ).bind(userId).first();
  }

  return c.json(profile);
});

export { minecraft };