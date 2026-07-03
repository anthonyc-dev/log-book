"use client";

import { Calendar, Clock, Activity, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Daily",
    url: "/dashboard",
    icon: Calendar,
  },
  {
    title: "Overtime",
    url: "/dashboard/ot",
    icon: Clock,
  },
  {
    title: "Activity",
    url: "/dashboard/activity",
    icon: Activity,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-background border-t border-border pb-safe pt-2 px-2 h-16">
      {navItems.map((item) => {
        const isActive = pathname === item.url;
        return (
          <button
            key={item.title}
            onClick={() => router.push(item.url)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 rounded-md transition-colors",
              isActive ? "text-yellow-500" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </button>
        );
      })}
      
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex flex-col items-center justify-center w-full h-full space-y-1 rounded-md transition-colors text-red-400/70 hover:text-red-400"
      >
        <LogOut className="h-5 w-5" />
        <span className="text-[10px] font-medium">Sign Out</span>
      </button>
    </div>
  );
}
