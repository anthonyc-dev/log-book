import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const dbPath =
  process.env.DATABASE_URL?.replace("file:", "") || "./data/my-log.db";

// Ensure the data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create and export the database connection
export const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");

// Initialize the database schema with all required tables
export function initializeDb() {
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

  // Daily logs table
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
    const passwordHash = bcrypt.hashSync("admin123", 10);
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
        passwordHash,
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

// Run initialization immediately
initializeDb();
