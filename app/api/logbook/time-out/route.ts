import { db } from "@/db";
import { dailyLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

function calcHours(
  inn: Date | null | undefined,
  out: Date | null | undefined
): number {
  if (!inn || !out) return 0;
  return Math.max(0, new Date(out).getTime() - new Date(inn).getTime());
}

function sanitizeString(str: string, maxLength = 500): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"]/g, '').trim().substring(0, maxLength);
}

function isValidSession(value: unknown): boolean {
  return value === 'morning' || value === 'afternoon';
}

function isValidId(id: unknown): boolean {
  return typeof id === 'number' && id > 0 && Number.isFinite(id);
}

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
  }

  const body = await req.json().catch(() => ({}));

  const id = body.id;
  if (!isValidId(id)) {
    return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
  }

  const task = sanitizeString(body.task || '');
  if (!task) {
    return NextResponse.json({ error: 'Task description is required' }, { status: 400 });
  }

  const session = sanitizeString(body.session ?? 'morning', 20);
  if (!isValidSession(session)) {
    return NextResponse.json({ error: 'Invalid session type' }, { status: 400 });
  }

  const now = new Date();

  const existing = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.id, id));

  if (!existing[0]) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const rec = existing[0];

  const isAfternoon = session === "afternoon";

  const updatePayload: Record<string, unknown> = isAfternoon
    ? { pmTimeOut: now, pmTask: task, status: "completed" }
    : { timeOut: now, task: task, status: "completed" };

  const amMs = calcHours(
    rec.timeIn,
    isAfternoon ? rec.timeOut : now
  );
  const pmMs = calcHours(
    rec.pmTimeIn,
    isAfternoon ? now : rec.pmTimeOut
  );
  const totalMs = amMs + pmMs;

  if (totalMs > 0) {
    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    updatePayload.totalHours = `${hours}h ${minutes}m`;
  }

  const result = await db
    .update(dailyLogs)
    .set(updatePayload)
    .where(eq(dailyLogs.id, id))
    .returning();

  return NextResponse.json(result[0]);
}
