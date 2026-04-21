import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Industrial Log | Control Center",
  description: "High-precision activity logging system",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "dark"
      )}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col font-sans">
        <div className="scanning-line" aria-hidden="true" />
        <TooltipProvider>
          <Providers>
            {children}
            <Toaster position="top-right" />
          </Providers>
        </TooltipProvider>
      </body>
    </html>
  );
}
