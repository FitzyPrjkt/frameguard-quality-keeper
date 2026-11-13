import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Clock, Film, LayoutGrid, Plus, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogoMark } from "@/components/fg/logo";
import { ThemeToggle } from "@/components/fg/theme-toggle";
import { CONFIG_NAV, PAGE_CONTEXT, WORKSPACE_NAV, type NavItem } from "@/components/fg/nav-config";
import { furthestReachableStep, stepAt, useWorkflow } from "@/lib/frameguard/workflow";

function usePathname() {
  return useRouterState({ select: (s) => s.location.pathname });
}

function usePrepareTarget() {
  const w = useWorkflow();
  return stepAt(furthestReachableStep(w)).to;
}

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] tracking-wider uppercase">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = item.match.includes(pathname);
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                  <Link to={item.to} onClick={() => setOpenMobile(false)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function AppSidebar() {
  const target = usePrepareTarget();
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pt-4 pb-2 group-data-[collapsible=icon]:px-2">
        <Link to="/" className="flex items-center gap-2.5 rounded-md px-1 py-1" onClick={() => setOpenMobile(false)}>
          <LogoMark className="shrink-0" />
          <span className="text-[15px] font-semibold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            FrameGuard
          </span>
        </Link>
        <SidebarMenu className="mt-3">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Prepare video"
              className="bg-primary font-medium text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <Link to={target} onClick={() => setOpenMobile(false)}>
                <Plus />
                <span>Prepare Video</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <NavGroup label="Workspace" items={WORKSPACE_NAV} />
        <NavGroup label="Configuration" items={CONFIG_NAV} />
      </SidebarContent>
      <SidebarFooter className="px-4 pb-4 group-data-[collapsible=icon]:hidden">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Web prototype · All media data is simulated.
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function TopBar() {
  const pathname = usePathname();
  const ctx = PAGE_CONTEXT[pathname];
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur-sm sm:px-4">
      <SidebarTrigger aria-label="Toggle navigation" />
      <span className="mx-1 hidden h-4 w-px bg-border sm:block" aria-hidden />
      <div className="flex min-w-0 items-center gap-1.5 text-sm">
        <Link to="/" className="flex items-center md:hidden" aria-label="FrameGuard home">
          <LogoMark className="size-5" />
        </Link>
        {ctx && (
          <>
            <span className="hidden text-muted-foreground sm:inline">{ctx.section}</span>
            <span className="hidden text-muted-foreground/60 sm:inline" aria-hidden>/</span>
            <span className="truncate font-medium text-foreground">{ctx.title}</span>
          </>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <span className="mr-1 hidden rounded border border-dashed border-border px-1.5 py-0.5 text-[11px] text-muted-foreground sm:inline">
          Prototype
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const navigate = useNavigate();
  const target = usePrepareTarget();
  const items = [
    { to: "/" as const, label: "Overview", icon: LayoutGrid, match: ["/"] },
    { to: "/videos" as const, label: "Videos", icon: Film, match: ["/videos"] },
    null,
    { to: "/history" as const, label: "History", icon: Clock, match: ["/history"] },
    { to: "/settings" as const, label: "Settings", icon: Settings, match: ["/settings", "/profiles"] },
  ];
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5 items-center">
        {items.map((item, i) =>
          item === null ? (
            <li key="prepare" className="flex justify-center">
              <Button
                size="icon"
                className="size-11 rounded-full shadow-sm"
                aria-label="Prepare video"
                onClick={() => navigate({ to: target })}
              >
                <Plus className="size-5" />
              </Button>
            </li>
          ) : (
            <li key={i}>
              <Link
                to={item.to}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 text-[11px]",
                  item.match.includes(pathname) ? "text-primary" : "text-muted-foreground",
                )}
                aria-current={item.match.includes(pathname) ? "page" : undefined}
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-background">
          <TopBar />
          <main id="main" className="flex-1">
            {children}
          </main>
        </SidebarInset>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
