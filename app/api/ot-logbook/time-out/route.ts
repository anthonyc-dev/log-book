import { db } from "@/db";
import { otLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

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

function isValidId(id: unknown): boolean {
  return typeof id === 'number' && id > 0 && Number.isFinite(id);
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

  const id = body.id;
  if (!isValidId(id)) {
    return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
  }

  const task = sanitizeString(body.task || '');
  if (!task) {
    return NextResponse.json({ error: 'Task description is required' }, { status: 400 });
  }

  const now = new Date();

  const existing = await db
    .select()
    .from(otLogs)
    .where(eq(otLogs.id, id));

  if (!existing[0]) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (existing[0].userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const rec = existing[0];

  const updatePayload: Record<string, unknown> = { timeOut: now, task: task, status: "completed" };

  const totalMs = calcHours(rec.timeIn, now);

  if (totalMs > 0) {
    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    updatePayload.totalHours = `${hours}h ${minutes}m`;
  }

  const result = await db
    .update(otLogs)
    .set(updatePayload)
    .where(eq(otLogs.id, id))
    .returning();

  return NextResponse.json(result[0]);
}
