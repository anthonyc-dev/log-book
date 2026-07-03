import { db } from "@/db";
import { dailyLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"]/g, '').trim().substring(0, 100);
}

function isValidSession(value: unknown): boolean {
  return value === 'morning' || value === 'afternoon';
}

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const contentType = req.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
  }

  const body = await req.json().catch(() => ({}));
  
  const sessionType = sanitizeString(body.session ?? 'morning');
  if (!isValidSession(sessionType)) {
    return NextResponse.json({ error: 'Invalid session type' }, { status: 400 });
  }

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' });
  const todayDate = formatter.format(now);

  if (sessionType === "afternoon") {
    const existingToday = await db
      .select()
      .from(dailyLogs)
      .where(eq(dailyLogs.date, todayDate))
      .orderBy(desc(dailyLogs.createdAt));

    const morningLog = existingToday.find(
      (r) => r.timeIn && r.date === todayDate && !r.pmTimeIn && r.userId === userId
    );

    if (morningLog) {
      const result = await db
        .update(dailyLogs)
        .set({ pmTimeIn: now, pmTask: "", status: "active" })
        .where(eq(dailyLogs.id, morningLog.id))
        .returning();
      return NextResponse.json(result[0]);
    }

    const result = await db
      .insert(dailyLogs)
      .values({
        userId: userId,
        date: todayDate,
        pmTimeIn: now,
        pmTask: "",
        status: "active",
      })
      .returning();
    return NextResponse.json(result[0]);
  }

  const result = await db
    .insert(dailyLogs)
    .values({
      userId: userId,
      date: todayDate,
      timeIn: now,
      task: "",
      status: "active",
    })
    .returning();

  return NextResponse.json(result[0]);
}

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const result = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(desc(dailyLogs.createdAt));

  const activeSession = result.find(
    (r) => r.status === "active" && r.timeIn && !r.timeOut
  );
  // Also include records with pm active
  const pmActive = result.find(
    (r) => r.status === "active" && r.pmTimeIn && !r.pmTimeOut
  );

  return NextResponse.json(activeSession || pmActive || null);
}