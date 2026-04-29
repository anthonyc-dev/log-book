import { db } from "@/db";
import { dailyLogs } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import * as XLSX from "xlsx";
import { NextResponse } from "next/server";

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────
function fmt(ts: Date | null | undefined, placeholder = ""): string {
  if (!ts) return placeholder;
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function isPM(ts: Date | null | undefined): boolean {
  if (!ts) return false;
  const hour = new Date(ts).getHours();
  return hour >= 12;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return days[d.getDay()];
}

function calcDuration(
  inn: Date | null | undefined,
  out: Date | null | undefined,
): number {
  if (!inn || !out) return 0;
  return Math.max(0, new Date(out).getTime() - new Date(inn).getTime());
}

// ────────────────────────────────────────────────────────────────
// Style presets
// ────────────────────────────────────────────────────────────────
const BLUE = "1F6BB0"; // MORNING header colour (matches image)
const NAVY = "17375E"; // AFTERNOON header colour (matches image)

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

// ────────────────────────────────────────────────────────────────
// GET /api/logbook/export
// ────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const baseQuery = db.select().from(dailyLogs).orderBy(desc(dailyLogs.date));

  let data;
  if (startDate && endDate) {
    data = await baseQuery.where(sql`${dailyLogs.date} >= ${startDate} AND ${dailyLogs.date} <= ${endDate}`);
  } else {
    data = await baseQuery;
  }

  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};

  // ── Row 1  (GROUP HEADERS) ──────────────────────────────────
  // Columns: A=DATE  B=AM-TI  C=AM-TO  D=AM-TASK  E=PM-TI  F=PM-TO  G=PM-TASK  H=TOTAL
  //          0       1        2         3           4        5         6           7

  ws["A1"] = hdrCell("DATE", BLUE);
  ws["B1"] = hdrCell("MORNING", BLUE); // merged B1:D1
  ws["C1"] = hdrCell("", BLUE);
  ws["D1"] = hdrCell("", BLUE);
  ws["E1"] = hdrCell("AFTERNOON", BLUE); // merged E1:G1
  ws["F1"] = hdrCell("", BLUE);
  ws["G1"] = hdrCell("", BLUE);
  ws["H1"] = hdrCell("TOTAL HOURS", BLUE);

  // ── Row 2  (COLUMN HEADERS) ─────────────────────────────────
  ws["A2"] = hdrCell("DATE", BLUE);
  ws["B2"] = hdrCell("TIME IN", BLUE);
  ws["C2"] = hdrCell("TIME OUT", BLUE);
  ws["D2"] = hdrCell("TASK", BLUE);
  ws["E2"] = hdrCell("TIME IN", BLUE);
  ws["F2"] = hdrCell("TIME OUT", BLUE);
  ws["G2"] = hdrCell("TASK", BLUE);
  ws["H2"] = hdrCell("TOTAL HOURS", BLUE);

  // ── Data rows ───────────────────────────────────────────────
  let grandMs = 0;

  data.forEach((rec, i) => {
    const rowNum = i + 3; // 1-indexed; rows 1+2 are headers

    const amMs = calcDuration(rec.timeIn, rec.timeOut);
    const pmMs = calcDuration(rec.pmTimeIn, rec.pmTimeOut);
    const totalMs = amMs + pmMs;
    grandMs += totalMs;

    let totalStr = "";
    if (totalMs > 0) {
      const h = Math.floor(totalMs / (1000 * 60 * 60));
      const m = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
      totalStr = `${h}h ${m}m`;
    } else if (rec.totalHours) {
      totalStr = rec.totalHours;
    }

    const dayLabel = getDayLabel(rec.date);
    const dateDisplay = `${rec.date}  ${dayLabel}`;

    // Determine if timeIn is PM - if so, swap AM and PM columns
    const isTimeInPM = isPM(rec.timeIn);

    const amTimeIn = isTimeInPM
      ? fmt(rec.pmTimeIn, "--")
      : fmt(rec.timeIn, "--");
    const amTimeOut = isTimeInPM
      ? fmt(rec.pmTimeOut, "--")
      : fmt(rec.timeOut, "--");
    const amTask = isTimeInPM ? rec.pmTask || "--" : rec.task || "--";
    const pmTimeIn = isTimeInPM
      ? fmt(rec.timeIn, "--")
      : fmt(rec.pmTimeIn, "--");
    const pmTimeOut = isTimeInPM
      ? fmt(rec.timeOut, "--")
      : fmt(rec.pmTimeOut, "--");
    const pmTask = isTimeInPM ? rec.task || "--" : rec.pmTask || "--";

    ws[`A${rowNum}`] = dataCell(dateDisplay, true);
    ws[`B${rowNum}`] = dataCell(amTimeIn);
    ws[`C${rowNum}`] = dataCell(amTimeOut);
    ws[`D${rowNum}`] = dataCell(amTask, false, true);
    ws[`E${rowNum}`] = dataCell(pmTimeIn);
    ws[`F${rowNum}`] = dataCell(pmTimeOut);
    ws[`G${rowNum}`] = dataCell(pmTask, false, true);
    ws[`H${rowNum}`] = dataCell(totalStr, true);
  });

  // ── TOTAL row ───────────────────────────────────────────────
  const totalRow = data.length + 3;
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

  // Merge A through G for the TOTAL label
  for (const col of ["B", "C", "D", "E", "F", "G"]) {
    ws[`${col}${totalRow}`] = {
      t: "s",
      v: "",
      s: {
        fill: { fgColor: { rgb: NAVY } },
        border: allBorders(),
      },
    };
  }

  ws[`H${totalRow}`] = {
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
    e: { r: totalRow - 1, c: 7 },
  });

  ws["!merges"] = [
    // Row 1 group headers
    { s: { r: 0, c: 1 }, e: { r: 0, c: 3 } }, // MORNING  B1:D1
    { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } }, // AFTERNOON E1:G1
    // Total row label
    { s: { r: totalRow - 1, c: 0 }, e: { r: totalRow - 1, c: 6 } },
  ];

  // ── Column widths ────────────────────────────────────────────
  ws["!cols"] = [
    { wch: 18 }, // A DATE
    { wch: 10 }, // B AM TIME IN
    { wch: 10 }, // C AM TIME OUT
    { wch: 38 }, // D AM TASK
    { wch: 10 }, // E PM TIME IN
    { wch: 10 }, // F PM TIME OUT
    { wch: 38 }, // G PM TASK
    { wch: 14 }, // H TOTAL HOURS
  ];

  // ── Row heights ──────────────────────────────────────────────
  ws["!rows"] = [
    { hpt: 20 }, // row 1 - group header
    { hpt: 18 }, // row 2 - column header
    ...data.map(() => ({ hpt: 40 })), // data rows
    { hpt: 18 }, // total row
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Logbook");

  const buffer = XLSX.write(wb, {
    type: "buffer",
    bookType: "xlsx",
    cellStyles: true,
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Disposition": "attachment; filename=logbook.xlsx",
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
