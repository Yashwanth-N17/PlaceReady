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

export const DashboardLayout = ({
  role,
  children,
  title,
  subtitle,
  initials = "U",
  actions,
}: Props) => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <RoleSidebar role={role} />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top header bar */}
          <header className="sticky top-0 z-40 h-14 flex items-center gap-3 border-b border-border bg-background/90 backdrop-blur-xl px-4 md:px-5">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />

            <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-8 bg-muted/50 border-border/60 text-sm focus:border-primary/40 focus:bg-muted/80 transition-colors placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            <div className="flex-1 md:hidden" />

            <div className="flex items-center gap-2.5">
              <NotificationBell role={role} />
              {/* Avatar */}
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-[11px] font-semibold text-white shadow-sm ring-2 ring-border">
                {initials}
              </div>
            </div>
          </header>

          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto"
          >
            {(title || subtitle || actions) && (
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  {title && (
                    <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-foreground">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {subtitle}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center gap-2 flex-wrap">{actions}</div>
                )}
              </div>
            )}
            {children}
          </motion.main>
        </div>
      </div>
    </SidebarProvider>
  );
};
