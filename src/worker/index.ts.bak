import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { minecraft } from "./minecraft";
import { vpn } from "./vpn";
import { profile } from "./profile";

const app = new Hono<{ Bindings: Env }>();

// CORS for your frontend
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Auth routes
app.route("/api/auth", auth);
app.route("/api/minecraft", minecraft);
app.route("/api/vpn", vpn);
app.route("/api/profile", profile);

export default app;