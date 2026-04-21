CREATE TABLE "daily_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text DEFAULT '1' NOT NULL,
	"date" text NOT NULL,
	"time_in" timestamp,
	"time_out" timestamp,
	"task" text,
	"description" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "attendance" CASCADE;--> statement-breakpoint
DROP TABLE "tasks" CASCADE;