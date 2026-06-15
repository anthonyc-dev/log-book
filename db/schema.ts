import { pgTable, serial, integer, text, primaryKey, timestamp } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

// =====================
// NextAuth Tables
// =====================

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { mode: "date" }).$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { mode: "date" }).$defaultFn(() => new Date()),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

// =====================
// Application Tables
// =====================

export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),

  // — Morning —
  timeIn: timestamp("time_in", { mode: "date" }),
  timeOut: timestamp("time_out", { mode: "date" }),
  task: text("task"),

  // — Afternoon —
  pmTimeIn: timestamp("pm_time_in", { mode: "date" }),
  pmTimeOut: timestamp("pm_time_out", { mode: "date" }),
  pmTask: text("pm_task"),

  // — Summary —
  totalHours: text("total_hours"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at", { mode: "date" }).$defaultFn(() => new Date()),
});
