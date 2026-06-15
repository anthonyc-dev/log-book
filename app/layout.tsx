import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Digital Log | Log-book",
  description: "High-precision activity logging system",
  icons: {
    icon: "/clock-v3.png",
    shortcut: "/clock-v3.png",
    apple: "/clock-v3.png",
  },
};

export const viewport = {
  themeColor: "#000000",
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
        "dark",
        "scroll-smooth"
      )}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col font-sans">
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
