import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Briefcase,
  BookOpen,
  Upload,
  CalendarDays,
  Building2,
  LogOut,
  Sparkles,
  TrendingUp,
  FileText,
  ListChecks,
  ClipboardList,
  UserCog,
} from "lucide-react";
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
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

export type Role = "student" | "faculty" | "placement";

type MenuItem = { title: string; url: string; icon: any };
type MenuGroup = { label: string; items: MenuItem[] };

const MENUS: Record<Role, MenuGroup[]> = {
  student: [
    {
      label: "Workspace",
      items: [
        { title: "Dashboard", url: "/student", icon: LayoutDashboard },
        { title: "My Tests", url: "/student/tests", icon: BookOpen },
        { title: "Training", url: "/student/training", icon: Sparkles },
        { title: "Drives", url: "/student/drives", icon: Briefcase },
      ],
    },
  ],
  faculty: [
    {
      label: "Manage",
      items: [
        { title: "Overview", url: "/faculty", icon: LayoutDashboard },
        { title: "Question Bank", url: "/faculty/questions", icon: FileText },
        { title: "Schedule Tests", url: "/faculty/schedule", icon: CalendarDays },
        { title: "Manual Review", url: "/faculty/review", icon: ClipboardList },
      ],
    },
    {
      label: "Analytics",
      items: [
        { title: "Reports", url: "/faculty/reports", icon: FileText },
      ],
    },
  ],
  placement: [
    {
      label: "Pipeline",
      items: [
        { title: "Overview", url: "/placement", icon: LayoutDashboard },
        { title: "Companies", url: "/placement/companies", icon: Building2 },
        { title: "Shortlisting", url: "/placement/shortlist", icon: ListChecks },
        { title: "Drives", url: "/placement/drives", icon: CalendarDays },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "Trends", url: "/placement/trends", icon: TrendingUp },
        { title: "Reports", url: "/placement/reports", icon: FileText },
      ],
    },
  ],
};

const ROLE_META: Record<Role, { label: string; sub: string; icon: any; color: string }> = {
  student: { label: "PlaceReady", sub: "Student Portal", icon: GraduationCap, color: "from-primary to-primary/70" },
  faculty: { label: "PlaceReady", sub: "Faculty Portal", icon: UserCog, color: "from-info to-info/70" },
  placement: { label: "PlaceReady", sub: "Placement Portal", icon: Briefcase, color: "from-success to-success/70" },
};

export function RoleSidebar({ role }: { role: Role }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const groups = MENUS[role];
  const meta = ROLE_META[role];
  const Icon = meta.icon;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      {/* Logo / Brand */}
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3.5">
        <NavLink to="/" className="flex items-center gap-2.5 min-w-0">
          <div className={cn("rounded-lg bg-gradient-to-br p-1.5 shrink-0 shadow-sm", meta.color)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-display font-bold text-sm leading-none text-foreground tracking-tight">
                {meta.label}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                {meta.sub}
              </span>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-3 gap-0">
        {groups.map((g) => (
          <SidebarGroup key={g.label} className="mb-3 p-0">
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 px-3 mb-1 h-auto py-0">
                {g.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                      <NavLink
                        to={item.url}
                        end
                        className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm w-full transition-all duration-150 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        activeClassName="!bg-primary/10 !text-primary font-medium border-r-2 border-primary"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer / Sign out */}
      <SidebarFooter className="border-t border-sidebar-border px-2 py-2">
        <NavLink
          to="/"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
