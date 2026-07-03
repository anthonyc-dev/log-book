"use client";

import { Calendar, Clock, Activity, LogOut, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Daily Logbook",
    url: "/dashboard",
    icon: Calendar,
  },
  {
    title: "Overtime Logbook",
    url: "/dashboard/ot",
    icon: Clock,
  },
  {
    title: "Activity History",
    url: "/dashboard/activity",
    icon: Activity,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0].toUpperCase() || "U";

  return (
    <Sidebar variant="inset" className="border-r border-border bg-background">
      <SidebarHeader className="p-4 flex items-center border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/20 overflow-hidden">
            <Image src="/clock-v3.png" alt="LogBook Logo" width={32} height={32} className="object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-100">
            LogBook
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mt-4 mb-2 px-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => router.push(item.url)}
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "bg-zinc-800/80 text-yellow-500 hover:bg-zinc-800 hover:text-yellow-400"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="bg-zinc-800/50" />

      <SidebarFooter className="p-4">
        {user ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-zinc-900/50 p-2 border border-zinc-800/50">
              <div className="h-9 w-9 rounded-lg bg-linear-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-xs font-bold text-zinc-900 shadow-inner">
                {initials}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-zinc-200 truncate">
                  {user.name || "User"}
                </span>
                <span className="text-xs text-zinc-500 truncate">
                  {user.email}
                </span>
              </div>
            </div>

            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  {isSigningOut ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4 mr-2" />
                  )}
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        ) : (
          <div className="flex items-center justify-center h-12">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
