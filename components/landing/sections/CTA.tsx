import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function CTA() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden bg-background"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-10 sm:p-14">
          {/* Decorative glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[280px] w-[520px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          />
          {/* Corner bracket */}
          <span
            aria-hidden="true"
            className="absolute left-4 top-4 size-3 border-l-2 border-t-2 border-primary/60"
          />
          <span
            aria-hidden="true"
            className="absolute right-4 top-4 size-3 border-r-2 border-t-2 border-primary/60"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-4 left-4 size-3 border-b-2 border-l-2 border-primary/60"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-4 right-4 size-3 border-b-2 border-r-2 border-primary/60"
          />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
              <span aria-hidden="true">// </span>
              Ready when you are
            </p>
            <h2
              id="cta-heading"
              className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              Start your first digital log today.
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
              Free to get started. No credit card. Bring your team or just
              yourself — your data, your reports, your control center.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: "default", size: "lg" }))}
              >
                Create free account
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
