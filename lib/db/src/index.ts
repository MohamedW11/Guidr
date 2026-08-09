import { config } from "dotenv";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Ensure .env is loaded if process.env.DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  config({ path: path.resolve(process.cwd(), ".env") });
}

const connectionString = process.env.DATABASE_URL || "postgresql://guidr:guidr@localhost:5434/guidr";
const isProduction = process.env.NODE_ENV === "production";
const requiresSsl = isProduction || connectionString.includes("sslmode=require") || connectionString.includes("ssl=true");

export const pool = new Pool({
  connectionString,
  ...(requiresSsl && !connectionString.includes("sslmode=disable")
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
  max: 10,
  idleTimeoutMillis: 30000,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
