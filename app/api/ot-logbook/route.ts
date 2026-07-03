import { db } from "@/db";
import { otLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

function sanitizeString(str: string, maxLength = 200): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"]/g, '').trim().substring(0, maxLength);
}

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await db
    .select()
    .from(otLogs)
    .where(eq(otLogs.userId, session.user.id))
    .orderBy(desc(otLogs.createdAt));
    
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = req.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
  }

  const body = await req.json().catch(() => ({}));
  const task = sanitizeString(body.task || '');

  const now = new Date();
  const todayDate = now.toISOString().split("T")[0];

  const result = await db
    .insert(otLogs)
    .values({
      userId: session.user.id,
      date: todayDate,
      task: task,
      status: "active",
    })
    .returning();

  return NextResponse.json(result[0]);
}
