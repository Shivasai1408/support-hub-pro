import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Inbox,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import logo from "@/assets/helm-logo.png";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { useSupport } from "@/lib/support-store";

const workspace = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "Customers", url: "/customers", icon: Users },
] as const;

const insights = [
  { title: "Knowledge base", url: "/knowledge", icon: BookOpen },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { tickets } = useSupport();
  const openCount = tickets.filter((t) => t.status === "open").length;

  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  const renderItems = (items: readonly { title: string; url: string; icon: typeof Inbox }[]) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
            <Link to={item.url} className="flex items-center gap-2">
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
              {!collapsed && item.url === "/inbox" && openCount > 0 && (
                <span className="ml-auto rounded-full bg-sidebar-primary/20 px-1.5 py-0.5 text-[11px] font-semibold text-sidebar-primary-foreground/90">
                  {openCount}
                </span>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2.5 px-1.5 py-1.5">
          <img src={logo} alt="" className="size-7 shrink-0" />
          {!collapsed && (
            <span className="flex flex-col leading-tight">
              <span className="font-display text-sm font-semibold">Helm Support</span>
              <span className="text-[11px] text-sidebar-foreground/60">AI service desk</span>
            </span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(workspace)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(insights)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {!collapsed ? (
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold">
              <Sparkles className="size-3.5 text-sidebar-primary" />
              AI copilot active
            </p>
            <p className="mt-1 text-[11px] text-sidebar-foreground/65">
              Drafting replies and routing tickets on {openCount} open conversations.
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <Sparkles className="size-4 text-sidebar-primary" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
