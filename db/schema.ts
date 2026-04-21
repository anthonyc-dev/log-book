import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const dailyLogs = sqliteTable("daily_logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("1"),
  date: text("date").notNull(),

  // — Morning —
  timeIn: integer("time_in", { mode: "timestamp" }),
  timeOut: integer("time_out", { mode: "timestamp" }),
  task: text("task"),           // morning task (kept for backward-compat)

  // — Afternoon —
  pmTimeIn: integer("pm_time_in", { mode: "timestamp" }),
  pmTimeOut: integer("pm_time_out", { mode: "timestamp" }),
  pmTask: text("pm_task"),

  // — Summary —
  totalHours: text("total_hours"),
  status: text("status").default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});