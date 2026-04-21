import { drizzle } from "drizzle-orm/better-sqlite3";
import { sqlite } from "@/lib/db";
import { dailyLogs } from "./schema";

export { dailyLogs };

// Initialize the database
export function initializeDatabase() {
  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT '1',
      date TEXT NOT NULL,
      time_in INTEGER,
      time_out INTEGER,
      task TEXT,
      pm_time_in INTEGER,
      pm_time_out INTEGER,
      pm_task TEXT,
      total_hours TEXT,
      status TEXT DEFAULT 'active',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
}

// Create Drizzle instance
export const db = drizzle(sqlite, { schema: { dailyLogs } });