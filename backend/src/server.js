import app from "./app.js";
import { pool } from "./config/db.js";
import { env } from "./config/env.js";
import { runMigrations } from "./config/runMigrations.js";

const startServer = async () => {
  const server = app.listen(env.port, () => {
    console.log(`Backend server booting on port ${env.port}`);
  });

  try {
    console.log("Checking database connection...");
    await pool.query("SELECT 1");
    console.log("Database connection ok. Running migrations...");
    await runMigrations();
    console.log(`Backend server running on port ${env.port}`);
  } catch (error) {
    console.error("Failed to connect to the database", error);
    server.close(() => {
      process.exit(1);
    });
    setTimeout(() => process.exit(1), 1000).unref();
  }
};

startServer();
