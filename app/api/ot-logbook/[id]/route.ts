import { db } from "@/db";
import { otLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

type UpdateData = {
  date?: string;
  timeIn?: Date | null;
  timeOut?: Date | null;
  task?: string;
  totalHours?: string | null;
};

function sanitizeString(str: string, maxLength = 200): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"]/g, '').trim().substring(0, maxLength);
}

function calcHours(
  inn: Date | null | undefined,
  out: Date | null | undefined
): number {
  if (!inn || !out) return 0;
  return Math.max(0, new Date(out).getTime() - new Date(inn).getTime());
}

function parseLocalToUTC(localDateString: string): Date {
  const parts = localDateString.split(/[-T:]/);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const hour = parseInt(parts[3], 10);
  const min = parseInt(parts[4], 10);
  const phDate = new Date(year, month, day, hour, min);
  const offset = 8 * 60 * 60 * 1000;
  return new Date(phDate.getTime() - offset);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const logId = parseInt(id, 10);
  if (isNaN(logId) || logId <= 0) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));

  const updateData: UpdateData = {};

  if (body.date !== undefined) {
    updateData.date = sanitizeString(body.date, 10);
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

  const existing = await db
      .select()
      .from(otLogs)
      .where(eq(otLogs.id, logId));

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

  const totalMs = calcHours(timeIn, timeOut);

  if (totalMs > 0) {
    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    updateData.totalHours = `${hours}h ${minutes}m`;
  } else {
    updateData.totalHours = null; // clear it if they delete a punch
  }

  try {
    const result = await db
      .update(otLogs)
      .set(updateData)
      .where(eq(otLogs.id, logId))
      .returning();

    return NextResponse.json(result[0]);
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const logId = parseInt(id, 10);
  if (isNaN(logId) || logId <= 0) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  // Check if the log belongs to the user
  const existing = await db
      .select()
      .from(otLogs)
      .where(eq(otLogs.id, logId));

  if (existing.length === 0) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  }
  
  if (existing[0].userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const result = await db
      .delete(otLogs)
      .where(eq(otLogs.id, logId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Record not found or failed to delete' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: result[0] });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
