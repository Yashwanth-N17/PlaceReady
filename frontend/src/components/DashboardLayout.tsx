import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RoleSidebar, Role } from "@/components/RoleSidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/NotificationBell";

interface Props {
  role: Role;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  initials?: string;
  actions?: ReactNode;
}

export const DashboardLayout = ({ role, children, title, subtitle, initials = "AS", actions }: Props) => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <RoleSidebar role={role} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 h-16 flex items-center gap-3 border-b border-border bg-background/85 backdrop-blur-xl px-4 md:px-6">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search students, tests, companies..."
                  className="pl-9 bg-secondary/50 border-border h-9"
                />
              </div>
            </div>
            <div className="flex-1 md:hidden" />
            <div className="flex items-center gap-2">
              <NotificationBell role={role} />
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground shadow-glow">
                {initials}
              </div>
            </div>
          </header>

          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto"
          >
            {(title || subtitle || actions) && (
              <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  {title && <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">{title}</h1>}
                  {subtitle && <p className="text-muted-foreground mt-1 text-sm md:text-base">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
              </div>
            )}
            {children}
          </motion.main>
        </div>
      </div>
    </SidebarProvider>
  );
};
