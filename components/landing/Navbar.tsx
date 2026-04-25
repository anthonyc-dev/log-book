'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Activity, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#problem', label: 'Why digital' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 w-full px-4">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-3 backdrop-blur-md sm:px-5">
        {/* Brand */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
        >   
            <Image src={"/clock--v3.png"} height={50} width={50} alt='logo'/>
          <span className="flex flex-col leading-none">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Digital log
            </span>
            <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:block">
              LogBook
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            Login
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
          >
            Get started
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground md:hidden"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-border/60 bg-background/95 px-4 py-4 backdrop-blur-md md:hidden">
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col gap-1"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full justify-center')}
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'w-full justify-center')}
            >
              Get started
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}