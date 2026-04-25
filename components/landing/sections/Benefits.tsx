import { GraduationCap, Building2, Code2, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/landing/SectionHeader";

const AUDIENCES = [
  {
    icon: GraduationCap,
    label: "Students & interns",
    accent: "primary",
    points: [
      "Replace handwritten OJT logbooks entirely",
      "Generate submission-ready PDF reports",
      "Track real productivity, not just hours",
      "Never lose a week's worth of entries again",
    ],
  },
  {
    icon: Building2,
    label: "Organizations & supervisors",
    accent: "secondary",
    points: [
      "Monitor employee or intern activity accurately",
      "Cut administrative overhead and double-entry",
      "Audit trails tied to authenticated users",
      "Standardize reporting across teams and shifts",
    ],
  },
  {
    icon: Code2,
    label: "Developers & teams",
    accent: "accent",
    points: [
      "Modern stack: Next.js, Drizzle ORM, Electron",
      "Hybrid web + desktop architecture",
      "Real-world CRUD + time tracking patterns",
      "Easy to extend with auth, analytics, or APIs",
    ],
  },
];

const ACCENT_STYLES: Record<string, { ring: string; chip: string; bullet: string }> = {
  primary: {
    ring: "border-primary/30",
    chip: "border-primary/30 bg-primary/10 text-primary",
    bullet: "text-primary",
  },
  secondary: {
    ring: "border-secondary/30",
    chip: "border-secondary/30 bg-secondary/10 text-secondary",
    bullet: "text-secondary",
  },
  accent: {
    ring: "border-accent/30",
    chip: "border-accent/30 bg-accent/10 text-accent",
    bullet: "text-accent",
  },
};

export function Benefits() {
  return (
    <section
      id="benefits"
      aria-labelledby="benefits-heading"
      className="scroll-mt-20 bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeader
          eyebrow="04 — Benefits"
          title="Built for the people who actually use logbooks."
          description="Whether you're an intern submitting weekly reports or a supervisor managing dozens of staff, Industrial Log adapts to how you already work."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, label, accent, points }) => {
            const styles = ACCENT_STYLES[accent];
            return (
              <article
                key={label}
                className={`relative flex flex-col rounded-lg border ${styles.ring} bg-card/40 p-6 transition-colors hover:bg-card/70`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-md border ${styles.chip}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {label}
                  </h3>
                </div>

                <ul className="mt-6 space-y-3">
                  {points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <CheckCircle2
                        className={`mt-0.5 size-4 shrink-0 ${styles.bullet}`}
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
