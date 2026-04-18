import { DashboardLayout } from "@/components/DashboardLayout";
import { Role } from "@/components/RoleSidebar";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  role: Role;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  message?: string;
  cta?: string;
}

export const ComingSoon = ({
  role,
  title,
  subtitle,
  icon: Icon,
  message = "This module is being polished. Check back soon.",
  cta = "Back to dashboard",
}: Props) => (
  <DashboardLayout role={role} title={title} subtitle={subtitle}>
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-16 text-center max-w-2xl mx-auto"
    >
      <div className="mx-auto h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
        <Icon className="h-7 w-7 text-primary-foreground" />
      </div>
      <h3 className="text-2xl font-display font-bold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto">{message}</p>
      <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => history.back()}>
        {cta}
      </Button>
    </motion.div>
  </DashboardLayout>
);
