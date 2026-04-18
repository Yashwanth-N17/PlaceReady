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
      ],
    },
  ],
  faculty: [
    {
      label: "Manage",
      items: [
        { title: "Overview", url: "/faculty", icon: LayoutDashboard },
        { title: "My Mentees", url: "/faculty/students", icon: Users },
        { title: "Schedule Tests", url: "/faculty/schedule", icon: CalendarDays },
      ],
    },
    {
      label: "Data",
      items: [
        { title: "Upload Data", url: "/faculty/upload", icon: Upload },
        { title: "Marks Upload", url: "/faculty/marks", icon: ClipboardList },
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

const ROLE_META: Record<Role, { label: string; sub: string; icon: any }> = {
  student: { label: "PlaceReady", sub: "Student", icon: GraduationCap },
  faculty: { label: "PlaceReady", sub: "Faculty", icon: UserCog },
  placement: { label: "PlaceReady", sub: "Placement", icon: Briefcase },
};

const linkBase =
  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full";
const linkActive = "bg-sidebar-accent text-primary font-medium";

export function RoleSidebar({ role }: { role: Role }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const groups = MENUS[role];
  const meta = ROLE_META[role];
  const Icon = meta.icon;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="rounded-md bg-primary p-1.5 shrink-0">
            <Icon className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-display font-bold text-sm leading-none">{meta.label}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{meta.sub}</span>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-1">
                {g.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                      <NavLink to={item.url} end className={linkBase} activeClassName={linkActive}>
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

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <NavLink to="/" className={linkBase}>
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
