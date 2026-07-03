import { db } from "@/db";
import { otLogs } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";
import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────
function fmt(ts: Date | number | null | undefined, placeholder = ""): string {
  if (!ts) return placeholder;
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return days[d.getDay()];
}

function calcDuration(
  inn: Date | number | null | undefined,
  out: Date | number | null | undefined,
): number {
  if (!inn || !out) return 0;
  return Math.max(0, new Date(out).getTime() - new Date(inn).getTime());
}

// ────────────────────────────────────────────────────────────────
// Style presets
// ────────────────────────────────────────────────────────────────
const BLUE = "1F6BB0";
const NAVY = "17375E";

const borderThin = (colour = "000000") => ({
  style: "thin" as const,
  color: { rgb: colour },
});

const allBorders = (c = "000000") => ({
  top: borderThin(c),
  bottom: borderThin(c),
  left: borderThin(c),
  right: borderThin(c),
});

function hdrCell(
  v: string,
  bgRgb: string,
  fgRgb = "FFFFFF",
  bold = true,
): XLSX.CellObject {
  return {
    t: "s",
    v,
    s: {
      fill: { fgColor: { rgb: bgRgb } },
      font: { bold, color: { rgb: fgRgb } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: allBorders(),
    },
  };
}

function dataCell(v: string, bold = false, wrap = false): XLSX.CellObject {
  return {
    t: "s",
    v,
    s: {
      font: { bold, color: { rgb: "000000" } },
      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: wrap,
      },
      border: allBorders(),
    },
  };
}

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  let data;
  if (startDate && endDate) {
    data = await db
      .select()
      .from(otLogs)
      .where(
        sql`${otLogs.userId} = ${session.user.id} AND ${otLogs.date} >= ${startDate} AND ${otLogs.date} <= ${endDate}`
      )
      .orderBy(desc(otLogs.date));
  } else {
    data = await db
      .select()
      .from(otLogs)
      .where(eq(otLogs.userId, session.user.id))
      .orderBy(desc(otLogs.date));
  }

  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};

  // ── Row 1  (COLUMN HEADERS) ─────────────────────────────────
  ws["A1"] = hdrCell("DATE", BLUE);
  ws["B1"] = hdrCell("TIME IN", BLUE);
  ws["C1"] = hdrCell("TIME OUT", BLUE);
  ws["D1"] = hdrCell("TASK", BLUE);
  ws["E1"] = hdrCell("TOTAL HOURS", BLUE);

  // ── Data rows ───────────────────────────────────────────────
  let grandMs = 0;

  data.forEach((rec, i) => {
    const rowNum = i + 2; // 1-indexed; row 1 is headers

    const totalMs = calcDuration(rec.timeIn, rec.timeOut);
    grandMs += totalMs;

    let totalStr = "";
    if (totalMs > 0) {
      const h = Math.floor(totalMs / (1000 * 60 * 60));
      const m = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
      totalStr = `${h}h ${m}m`;
    }

    const dayLabel = getDayLabel(rec.date);
    const dateDisplay = `${rec.date}  ${dayLabel}`;

    const timeIn = fmt(rec.timeIn, "--");
    const timeOut = fmt(rec.timeOut, "--");
    const task = rec.task || "--";

    ws[`A${rowNum}`] = dataCell(dateDisplay, true);
    ws[`B${rowNum}`] = dataCell(timeIn);
    ws[`C${rowNum}`] = dataCell(timeOut);
    ws[`D${rowNum}`] = dataCell(task, false, true);
    ws[`E${rowNum}`] = dataCell(totalStr, true);
  });

  // ── TOTAL row ───────────────────────────────────────────────
  const totalRow = data.length + 2;
  const grandH = Math.floor(grandMs / (1000 * 60 * 60));
  const grandM = Math.floor((grandMs % (1000 * 60 * 60)) / (1000 * 60));

  ws[`A${totalRow}`] = {
    t: "s",
    v: "TOTAL",
    s: {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: NAVY } },
      alignment: { horizontal: "right", vertical: "center" },
      border: allBorders(),
    },
  };

  // Merge A through D for the TOTAL label
  for (const col of ["B", "C", "D"]) {
    ws[`${col}${totalRow}`] = {
      t: "s",
      v: "",
      s: {
        fill: { fgColor: { rgb: NAVY } },
        border: allBorders(),
      },
    };
  }

  ws[`E${totalRow}`] = {
    t: "s",
    v: `${grandH}h ${grandM}m`,
    s: {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: NAVY } },
      alignment: { horizontal: "center", vertical: "center" },
      border: allBorders(),
    },
  };

  // ── Sheet range + merges ─────────────────────────────────────
  ws["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: totalRow - 1, c: 4 },
  });

  ws["!merges"] = [
    // Total row label
    { s: { r: totalRow - 1, c: 0 }, e: { r: totalRow - 1, c: 3 } },
  ];

  // ── Column widths ────────────────────────────────────────────
  ws["!cols"] = [
    { wch: 18 }, // A DATE
    { wch: 10 }, // B TIME IN
    { wch: 10 }, // C TIME OUT
    { wch: 38 }, // D TASK
    { wch: 14 }, // E TOTAL HOURS
  ];

  // ── Row heights ──────────────────────────────────────────────
  ws["!rows"] = [
    { hpt: 18 }, // row 1 - column header
    ...data.map(() => ({ hpt: 40 })), // data rows
    { hpt: 18 }, // total row
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Overtime Logbook");

  const buffer = XLSX.write(wb, {
    type: "buffer",
    bookType: "xlsx",
    cellStyles: true,
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Disposition": "attachment; filename=ot-logbook.xlsx",
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
