import { drizzle } from "drizzle-orm/node-postgres";

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

export function createDb(env: DatabaseConfig) {
  const connectionUrl = process.env.DATABASE_URL || env.DATABASE_URL;
  return drizzle(connectionUrl, { relations });
}

export type Database = ReturnType<typeof createDb>;
