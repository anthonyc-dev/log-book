import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-zinc-950 flex flex-col flex-1 w-full min-h-screen">
        <header className="hidden md:flex h-14 shrink-0 items-center gap-2 border-b border-zinc-800/50 bg-zinc-950 px-4">
          <SidebarTrigger className="-ml-1 text-zinc-400 hover:text-zinc-100" />
          <div className="w-px h-4 bg-zinc-800 mx-2" />
        </header>
        <div className="flex flex-1 flex-col pb-16 md:pb-0">
          {children}
        </div>
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
