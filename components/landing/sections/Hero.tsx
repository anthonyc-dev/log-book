import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FileDown,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const HERO_STATS = [
  { label: "Avg. setup", value: "< 2 min", accent: "text-primary" },
  { label: "Time saved / week", value: "5+ hrs", accent: "text-secondary" },
  { label: "Data integrity", value: "100%", accent: "text-accent" },
];

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-background opacity-100"
      />
      {/* Background dot grid */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        backgroundImage:
          "radial-gradient(circle 5px at top left, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.02) 30%, transparent 30%, transparent 50%), linear-gradient(90deg, rgb(20,20,20), rgb(20,20,20))",
        backgroundSize: "11px 11px",
      }}
    />
      {/* Radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      {/* Secondary glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-[40%] -z-10 h-[320px] w-[420px] rounded-full bg-accent/10 blur-3xl"
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow / status pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 backdrop-blur">
            <span
              aria-hidden="true"
              className="relative flex size-2"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30 opacity-80" />
              <span className="relative inline-flex size-2 rounded-full bg-primary/30" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Live · Digital Logbook v1
            </span>
          </div>

          <h1
            id="hero-heading"
            className="mt-8 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            The end of paper logbooks.
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Track work with precision.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Industrial Log replaces fragile paper logs and messy spreadsheets
            with a structured, secure, and exportable system. Clock in, log
            tasks, and generate reports in seconds — on desktop or web.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Start logging free
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              I already have an account
            </Link>
          </div>

          {/* Quick reassurance */}
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
              Secure by default
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" aria-hidden="true" />
              Automatic time tracking
            </li>
            <li className="inline-flex items-center gap-1.5">
              <FileDown className="size-3.5 text-primary" aria-hidden="true" />
              Export to PDF
            </li>
          </ul>
        </div>

        {/* Stat strip */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="relative rounded-lg border border-border/60 bg-card/40 p-5 backdrop-blur"
            >
              {/* Corner brackets */}
              <span
                aria-hidden="true"
                className="absolute left-2 top-2 size-2 border-l border-t border-primary/60"
              />
              <span
                aria-hidden="true"
                className="absolute right-2 top-2 size-2 border-r border-t border-primary/60"
              />
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {stat.label}
              </p>
              <p
                className={cn(
                  "mt-2 text-2xl font-semibold tracking-tight",
                  stat.accent
                )}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Mock dashboard window */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 shadow-2xl shadow-black/40 backdrop-blur">
            {/* Window chrome */}
            <div className="flex items-center justify-between border-b border-border/60 bg-card/60 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-destructive/80" aria-hidden="true" />
                <span className="size-2.5 rounded-full bg-secondary/80" aria-hidden="true" />
                <span className="size-2.5 rounded-full bg-primary/80" aria-hidden="true" />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                /dashboard · Industrial Log
              </p>
              <Activity className="size-3.5 text-primary" aria-hidden="true" />
            </div>
            {/* Body */}
            <div className="grid gap-4 p-6 md:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-background/60 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Time In
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  08:02:14
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Today · On schedule
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/60 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Active task
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  Inventory audit · Bay 3
                </p>
                <p className="mt-1 text-xs text-primary">● Logging</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/60 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Hours this week
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  32.5
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[68%] bg-gradient-to-r from-primary to-secondary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
