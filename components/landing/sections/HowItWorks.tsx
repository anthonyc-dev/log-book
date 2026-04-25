import { UserPlus, LogIn, ListChecks, FileDown } from "lucide-react";
import { SectionHeader } from "@/components/landing/SectionHeader";

const STEPS = [
  {
    icon: UserPlus,
    label: "Step 01",
    title: "Create your account",
    description:
      "Sign up in seconds. Your data is tied to your account and protected behind authentication.",
  },
  {
    icon: LogIn,
    label: "Step 02",
    title: "Clock in for the day",
    description:
      "One click logs your Time In with a precise timestamp. No more handwritten times or guessing.",
  },
  {
    icon: ListChecks,
    label: "Step 03",
    title: "Log tasks as you work",
    description:
      "Add tasks throughout the day. Each entry captures what you did, when, and how long it took.",
  },
  {
    icon: FileDown,
    label: "Step 04",
    title: "Export & submit",
    description:
      "Generate a polished PDF report at any time — perfect for OJT requirements, HR, or supervisors.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative scroll-mt-20 overflow-hidden bg-black/50 text-foreground"
    >
      {/* Subtle accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/5 blur-3xl"
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeader
          eyebrow="03 — How it works"
          title="From paper chaos to a clean digital log in four steps."
          description="No training session needed. If you can clock in at a time clock, you can use Industrial Log."
        />

        <ol
          aria-label="How Industrial Log works"
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map(({ icon: Icon, label, title, description }, index) => (
            <li
              key={title}
              className="relative flex flex-col rounded-lg border border-border/60 bg-card/40 p-6"
            >
              {/* Connector line on desktop */}
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-[-10px] top-12 hidden h-px w-5 bg-gradient-to-r from-primary/60 to-transparent lg:block"
                />
              ) : null}

              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {label}
                </span>
              </div>

              <h3 className="mt-5 text-base font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
