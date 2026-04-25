import {
  FileWarning,
  Search,
  Calculator,
  ShieldAlert,
  CloudOff,
  History,
} from "lucide-react";
import { SectionHeader } from "@/components/landing/SectionHeader";

const PROBLEMS = [
  {
    icon: FileWarning,
    title: "Lost or damaged pages",
    description:
      "Paper logs get coffee-stained, torn, or misplaced — and once an entry is gone, it's gone for good.",
  },
  {
    icon: Search,
    title: "Impossible to search",
    description:
      "Finding a single entry from last month means flipping through hundreds of handwritten pages.",
  },
  {
    icon: Calculator,
    title: "Manual hour math",
    description:
      "Time in, time out, breaks, overtime — calculated by hand, every day, with errors creeping in.",
  },
  {
    icon: ShieldAlert,
    title: "No accountability",
    description:
      "Anyone can edit, backdate, or rewrite a paper log. There's no audit trail, no user tied to entries.",
  },
  {
    icon: CloudOff,
    title: "No exports or reports",
    description:
      "Sharing logs with supervisors means photocopying, scanning, or retyping into spreadsheets.",
  },
  {
    icon: History,
    title: "Outdated for a digital workforce",
    description:
      "Modern teams work across devices and shifts. Paper can't keep up with hybrid or remote operations.",
  },
];

export function Problem() {
  return (
    <section
      id="problem"
      aria-labelledby="problem-heading"
      className="scroll-mt-20 bg-black/50 text-foreground"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeader
          eyebrow="01 — The problem"
          title="Paper logbooks weren't built for this century."
          description="Manual logs cost hours every week, hide errors, and disappear the moment a page is damaged. Industrial Log fixes the root cause — not the symptom."
        />

        <ul
          aria-label="Problems with paper logbooks"
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PROBLEMS.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="group relative rounded-lg border border-border/60 bg-card/40 p-6 transition-colors hover:border-destructive/40"
            >
              <div className="flex size-10 items-center justify-center rounded-md border border-destructive/30 bg-destructive/10 text-destructive">
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
