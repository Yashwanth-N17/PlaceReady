import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Briefcase,
  Settings,
  BookOpen,
  Upload,
  CalendarDays,
  Building2,
  ShieldCheck,
  LogOut,
  Sparkles,
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

const studentItems = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
  { title: "My Tests", url: "/student/tests", icon: BookOpen },
  { title: "Training", url: "/student/training", icon: Sparkles },
];

const facultyItems = [
  { title: "Overview", url: "/faculty", icon: LayoutDashboard },
  { title: "Students", url: "/faculty/students", icon: Users },
  { title: "Upload Data", url: "/faculty/upload", icon: Upload },
  { title: "Schedule Tests", url: "/faculty/schedule", icon: CalendarDays },
];

const placementItems = [
  { title: "Overview", url: "/placement", icon: LayoutDashboard },
  { title: "Companies", url: "/placement/companies", icon: Building2 },
];

const adminItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const linkBase =
  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
const linkActive = "bg-sidebar-accent text-primary font-medium";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const renderGroup = (label: string, items: typeof studentItems, icon: any) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} end className={linkBase} activeClassName={linkActive}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="rounded-md bg-gradient-primary p-1.5 shadow-glow">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm leading-none">PlaceReady</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Platform</span>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {renderGroup("Student", studentItems, GraduationCap)}
        {renderGroup("Faculty", facultyItems, Users)}
        {renderGroup("Placement", placementItems, Briefcase)}
        {renderGroup("Admin", adminItems, ShieldCheck)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <NavLink to="/login" className={linkBase}>
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
