import { db } from "@/db";
import { otLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' });
  const todayDate = formatter.format(now);

  const result = await db
    .insert(otLogs)
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
    .from(otLogs)
    .where(eq(otLogs.userId, userId))
    .orderBy(desc(otLogs.createdAt));

  const activeSession = result.find(
    (r) => r.status === "active" && r.timeIn && !r.timeOut
  );

  return NextResponse.json(activeSession || null);
}