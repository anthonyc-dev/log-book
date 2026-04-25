import {
  Clock,
  ClipboardList,
  LayoutDashboard,
  FileDown,
  Search,
  MonitorSmartphone,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { SectionHeader } from "@/components/landing/SectionHeader";

const FEATURES = [
  {
    icon: Clock,
    title: "Automatic time tracking",
    description:
      "One-tap Time In / Time Out. Total hours, breaks, and overtime calculated automatically — no spreadsheets required.",
    accent: "primary",
  },
  {
    icon: ClipboardList,
    title: "Structured task logging",
    description:
      "Log what you worked on, when, and for how long. Every entry is tied to a user and a session.",
    accent: "secondary",
  },
  {
    icon: LayoutDashboard,
    title: "Activity dashboard",
    description:
      "See today, this week, and historical sessions at a glance. Drill into any day to review entries.",
    accent: "accent",
  },
  {
    icon: FileDown,
    title: "Export to PDF & reports",
    description:
      "Generate clean, print-ready reports for supervisors, schools, or HR — in one click.",
    accent: "primary",
  },
  {
    icon: Search,
    title: "Search & filter",
    description:
      "Find any task or session by date, keyword, or project. Years of logs become instantly searchable.",
    accent: "secondary",
  },
  {
    icon: MonitorSmartphone,
    title: "Desktop & web ready",
    description:
      "Run as a native Electron desktop app for offline use, or as a web app — same data, same UI.",
    accent: "accent",
  },
  {
    icon: ShieldCheck,
    title: "Secure user accounts",
    description:
      "Each user signs in with their own credentials. Entries are tamper-evident and auditable.",
    accent: "primary",
  },
  {
    icon: Zap,
    title: "Built for speed",
    description:
      "Server-rendered pages, local SQLite via Drizzle ORM, and a UI tuned for fast logging.",
    accent: "secondary",
  },
];

const ACCENT_STYLES: Record<string, string> = {
  primary: "border-primary/30 bg-primary/10 text-primary",
  secondary: "border-secondary/30 bg-secondary/10 text-secondary",
  accent: "border-accent/30 bg-accent/10 text-accent",
};

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="scroll-mt-20 bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeader
          eyebrow="02 — Features"
          title="Everything you need to retire the paper logbook."
          description="A focused toolkit for time tracking, task logging, and reporting — no bloat, no learning curve."
        />

        <ul
          aria-label="Product features"
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map(({ icon: Icon, title, description, accent }) => (
            <li
              key={title}
              className="group relative flex flex-col rounded-lg border border-border/60 bg-card/40 p-6 transition-all hover:border-primary/40 hover:bg-card/70"
            >
              <div
                className={`flex size-10 items-center justify-center rounded-md border ${ACCENT_STYLES[accent]}`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
