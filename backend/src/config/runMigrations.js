import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const schemaFilePath = path.resolve(currentDir, "../../../database/schema.sql");

export const runMigrations = async () => {
  const client = await pool.connect();

  try {
    const schemaSql = await readFile(schemaFilePath, "utf8");

    await client.query("BEGIN");
    await client.query(schemaSql);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
