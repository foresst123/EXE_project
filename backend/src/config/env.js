import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5050),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  serverUrl: process.env.SERVER_URL || "http://localhost:5050",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/artdict_db",
  databaseSsl:
    process.env.DATABASE_SSL === "true" ||
    process.env.DATABASE_SSL === "1" ||
    process.env.DATABASE_URL?.includes("render.com") ||
    false,
  jwtSecret: process.env.JWT_SECRET || "super-secret-jwt-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
};
