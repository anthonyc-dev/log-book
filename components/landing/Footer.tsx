import Link from "next/link";
import Image from "next/image";

const PRODUCT_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#benefits", label: "Benefits" },
];

const RESOURCE_LINKS = [
  { href: "#problem", label: "Why digital" },
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Create account" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className=" bg-black/50 rounded-tl-3xl rounded-tr-3xl">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand block */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5"
              aria-label="Industrial Log home"
            >
             <Image src={"/clock-v3.png"} height={40} width={40} alt='logo'/>
             <span className="flex flex-col leading-none">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Digital log
              </span>
              <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:block">
                LogBook
              </span>
            </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A modern digital logbook that replaces paper-based logs with
              automated time tracking, structured task logging, and exportable
              reports.
            </p>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              <span className="mr-2 inline-block size-1.5 rounded-full bg-primary align-middle" />
              System status: Operational
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-foreground">
              Product
            </p>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-foreground">
              Resources
            </p>
            <ul className="mt-4 space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            © {year} Digital log | Log-book · All systems logged
          </p>
          <p className="text-xs text-muted-foreground">
            Built by MicroFlux Team
          </p>
        </div>
      </div>
    </footer>
  );
}
