import { db } from "@/db";
import { dailyLogs } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const query = db.select().from(dailyLogs).orderBy(desc(dailyLogs.date));

  let data;
  if (startDate && endDate) {
    data = await query.where(
      sql`${dailyLogs.date} >= ${startDate} AND ${dailyLogs.date} <= ${endDate}`,
    );
  } else {
    data = await query;
  }

  console.log("export-pdf: records found:", data?.length);

  let dateDisplay = "";
  if (startDate && endDate) {
    dateDisplay = `${startDate} to ${endDate}`;
  } else {
    const [range] = await db
      .select({
        minDate: sql`MIN(${dailyLogs.date})`.as("minDate"),
        maxDate: sql`MAX(${dailyLogs.date})`.as("maxDate"),
      })
      .from(dailyLogs);
    dateDisplay = `${range.minDate} to ${range.maxDate}`;
  }

  const logoPath = path.join(process.cwd(), "public", "Picture1.jpg");
  let logoBase64 = "";

  try {
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = logoBuffer.toString("base64");
    }
  } catch {
    console.log("Logo not found");
  }

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daily Logbook</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 20px;
      color: #333333;
      font-size: 11px;
    }
    
    .header {
      display: flex;
      align-items: center;
      padding-bottom: 15px;
    }
    
    .logo {
      width: 50px;
      height: 50px;
      margin-right: 15px;
    }
    
    .header-title {
      flex: 1;
    }
    
    .header-title h1 {
      margin: 0;
      color: #1F6BB0;
      font-size: 16px;
      font-weight: 700;
    }
    
    .header-title p {
      margin: 5px 0 0 0;
      color: #666666;
      font-size: 11px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    th {
      background-color: #1F6BB0;
      color: #ffffff;
      padding: 10px 8px;
      text-align: center;
      font-weight: 600;
      font-size: 10px;
      border: 1px solid #1a5a8a;
    }
    
    td {
      padding: 8px;
      border: 1px solid #dddddd;
      vertical-align: middle;
    }
    
    .group-header {
      background-color: #17375E !important;
      font-size: 12px;
      letter-spacing: 1px;
    }
    
    .total-row {
      background-color: #17375E;
      color: #ffffff;
      font-weight: 600;
    }
    
    .total-row td {
      border-color: #17375E;
    }
    
    .task-text {
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.4;
    }
    
    .date-cell {
      font-weight: 600;
    }
    
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #1F6BB0;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 9999;
    }
    
    .print-btn:hover {
      background: #155a8a;
    }
    
    @media print {
      @page {
        size: landscape;
        margin: 0.5in;
      }
      
      .print-btn {
        display: none;
      }
      
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      table {
        page-break-inside: auto;
      }
      
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      
      td {
        page-break-inside: avoid;
      }
      
      th {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
`;

  if (logoBase64) {
    html += `
    <div class="header">
      <img src="data:image/jpeg;base64,${logoBase64}" class="logo" alt="Logo" />
      <div class="header-title">
        <h1>DAILY LOGBOOK</h1>
        <p>Employee Time Tracking Report</p>
        <p>Date: ${dateDisplay}</p>
      </div>
    </div>
`;
  } else {
    html += `
    <div class="header">
      <div class="header-title">
        <h1>DAILY LOGBOOK</h1>
        <p>Employee Time Tracking Report</p>
      <p>Date: ${dateDisplay}</p>
      </div>
    </div>
`;
  }

  html += `
  <table>
    <thead>
      <tr>
        <th class="group-header" colspan="1">DATE</th>
        <th class="group-header" colspan="3">MORNING</th>
        <th class="group-header" colspan="3">AFTERNOON</th>
        <th class="group-header" colspan="1">TOTAL</th>
      </tr>
      <tr>
        <th>DATE</th>
        <th>TIME IN</th>
        <th>TIME OUT</th>
        <th>TASK</th>
        <th>TIME IN</th>
        <th>TIME OUT</th>
        <th>TASK</th>
        <th>TOTAL HOURS</th>
      </tr>
    </thead>
    <tbody>
`;

  let grandMs = 0;

  data.forEach((rec) => {
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

    html += `
      <tr>
        <td class="date-cell">${dateDisplay}</td>
        <td>${amTimeIn}</td>
        <td>${amTimeOut}</td>
        <td><span class="task-text">${amTask}</span></td>
        <td>${pmTimeIn}</td>
        <td>${pmTimeOut}</td>
        <td><span class="task-text">${pmTask}</span></td>
        <td>${totalStr}</td>
      </tr>
`;
  });

  const grandH = Math.floor(grandMs / (1000 * 60 * 60));
  const grandM = Math.floor((grandMs % (1000 * 60 * 60)) / (1000 * 60));

  html += `
      <tr class="total-row">
        <td colspan="7" style="text-align: right; padding-right: 20px;">TOTAL</td>
        <td>${grandH}h ${grandM}m</td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
