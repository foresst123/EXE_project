import app from "./app.js";
import { pool } from "./config/db.js";
import { env } from "./config/env.js";
import { runMigrations } from "./config/runMigrations.js";

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    await runMigrations();
    app.listen(env.port, () => {
      console.log(`Backend server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
};

startServer();
