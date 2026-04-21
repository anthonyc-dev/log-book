import { db } from "@/db";
import { dailyLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

function sanitizeString(str: string, maxLength = 200): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"]/g, '').trim().substring(0, maxLength);
}

export async function GET() {
  const result = await db.select().from(dailyLogs).orderBy(desc(dailyLogs.createdAt));
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
  }

  const body = await req.json().catch(() => ({}));
  const task = sanitizeString(body.task || '');

  const now = new Date();
  const todayDate = now.toISOString().split("T")[0];

  const result = await db
    .insert(dailyLogs)
    .values({
      userId: "1",
      date: todayDate,
      task: task,
      status: "active",
    })
    .returning();

  return NextResponse.json(result[0]);
}
