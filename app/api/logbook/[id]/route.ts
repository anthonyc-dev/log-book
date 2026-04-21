import { db } from "@/db";
import { dailyLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

function sanitizeString(str: string, maxLength = 200): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"]/g, '').trim().substring(0, maxLength);
}

function parseLocalToUTC(localDateTime: string | null): Date | null {
  if (!localDateTime) return null;
  const manilaWithTz = localDateTime + ":00+08:00";
  const manilaDate = new Date(manilaWithTz);
  if (isNaN(manilaDate.getTime())) return null;
  return manilaDate;
}

function calcHours(inn: Date | null | undefined, out: Date | null | undefined): number {
  if (!inn || !out) return 0;
  return Math.max(0, new Date(out).getTime() - new Date(inn).getTime());
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const logId = parseInt(id);
  
  if (isNaN(logId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const contentType = req.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
  }

  const body = await req.json().catch(() => ({}));
  
  const updateData: any = {};
  
  if (body.date !== undefined) {
    updateData.date = body.date;
  }
  if (body.timeIn !== undefined) {
    updateData.timeIn = parseLocalToUTC(body.timeIn);
  }
  if (body.timeOut !== undefined) {
    updateData.timeOut = parseLocalToUTC(body.timeOut);
  }
  if (body.task !== undefined) {
    updateData.task = sanitizeString(body.task || '');
  }
  if (body.pmTimeIn !== undefined) {
    updateData.pmTimeIn = parseLocalToUTC(body.pmTimeIn);
  }
  if (body.pmTimeOut !== undefined) {
    updateData.pmTimeOut = parseLocalToUTC(body.pmTimeOut);
  }
  if (body.pmTask !== undefined) {
    updateData.pmTask = sanitizeString(body.pmTask || '');
  }

  const existing = await db
      .select()
      .from(dailyLogs)
      .where(eq(dailyLogs.id, logId));

  if (existing.length === 0) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  }

  // Ensure user can only update their own logs
  if (existing[0].userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const rec = existing[0];
  const timeIn = updateData.timeIn !== undefined ? updateData.timeIn : rec.timeIn;
  const timeOut = updateData.timeOut !== undefined ? updateData.timeOut : rec.timeOut;
  const pmTimeIn = updateData.pmTimeIn !== undefined ? updateData.pmTimeIn : rec.pmTimeIn;
  const pmTimeOut = updateData.pmTimeOut !== undefined ? updateData.pmTimeOut : rec.pmTimeOut;

  const amMs = calcHours(timeIn, timeOut);
  const pmMs = calcHours(pmTimeIn, pmTimeOut);
  const totalMs = amMs + pmMs;

  const hasAm = timeIn && timeOut;
  const hasPm = pmTimeIn && pmTimeOut;

  if (hasAm || hasPm) {
    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    updateData.totalHours = `${hours}h ${minutes}m`;
  } else if (body.timeIn !== undefined || body.timeOut !== undefined || body.pmTimeIn !== undefined || body.pmTimeOut !== undefined) {
    updateData.totalHours = null;
  }

  try {
    const result = await db
      .update(dailyLogs)
      .set(updateData)
      .where(eq(dailyLogs.id, logId))
      .returning();

    return NextResponse.json(result[0]);
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const logId = parseInt(id);
  
  if (isNaN(logId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  // Check if the log belongs to the user
  const existing = await db
      .select()
      .from(dailyLogs)
      .where(eq(dailyLogs.id, logId));

  if (existing.length === 0) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  }

  // Ensure user can only delete their own logs
  if (existing[0].userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const result = await db
      .delete(dailyLogs)
      .where(eq(dailyLogs.id, logId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
