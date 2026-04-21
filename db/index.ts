import { drizzle } from "drizzle-orm/better-sqlite3";
import { sqlite } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  dailyLogs,
} from "./schema";

export { users, accounts, sessions, verificationTokens, dailyLogs };

// Create Drizzle instance
export const db = drizzle(sqlite, {
  schema: {
    users,
    accounts,
    sessions,
    verificationTokens,
    dailyLogs,
  },
});

// Initialize the database with all required tables
export function initializeDatabase() {
  // NextAuth tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER,
      image TEXT,
      password_hash TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      PRIMARY KEY (provider, provider_account_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires INTEGER NOT NULL,
      PRIMARY KEY (identifier, token)
    )
  `);

  // Daily logs table (updated with foreign key)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      time_in INTEGER,
      time_out INTEGER,
      task TEXT,
      pm_time_in INTEGER,
      pm_time_out INTEGER,
      pm_task TEXT,
      total_hours TEXT,
      status TEXT DEFAULT 'active',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create default user if not exists (migrate from old user_id = 1)
  const existingUser = sqlite
    .prepare("SELECT id FROM users WHERE id = ?")
    .get("user_1");
  if (!existingUser) {
    sqlite
      .prepare(
        `
      INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        "user_1",
        "Default User",
        "admin@example.com",
        "admin123",
        Date.now(),
        Date.now(),
      );
  }

  // Migrate existing logs to the new user if needed
  const checkOldUser = sqlite
    .prepare("SELECT id FROM daily_logs WHERE user_id = ?")
    .get("1");
  if (checkOldUser) {
    sqlite
      .prepare("UPDATE daily_logs SET user_id = ? WHERE user_id = ?")
      .run("user_1", "1");
  }
}
