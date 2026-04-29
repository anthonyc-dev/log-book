// Re-export db and schema from lib/db for backward compatibility
export { db } from "@/lib/db";
export {
  users,
  accounts,
  sessions,
  verificationTokens,
  dailyLogs,
} from "@/db/schema";

