import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  delay?: number;
  className?: string;
  accent?: "primary" | "success" | "warning" | "info" | "destructive";
}

const accentColors = {
  primary: {
    bar: "bg-primary",
    icon: "bg-primary/10 text-primary",
    badge: "text-primary",
  },
  success: {
    bar: "bg-success",
    icon: "bg-success/10 text-success",
    badge: "text-success",
  },
  warning: {
    bar: "bg-warning",
    icon: "bg-warning/10 text-warning",
    badge: "text-warning",
  },
  info: {
    bar: "bg-info",
    icon: "bg-info/10 text-info",
    badge: "text-info",
  },
  destructive: {
    bar: "bg-destructive",
    icon: "bg-destructive/10 text-destructive",
    badge: "text-destructive",
  },
};

export const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  changeType = "neutral",
  delay = 0,
  className,
  accent = "primary",
}: StatCardProps) => {
  const colors = accentColors[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn(
        "relative glass-card rounded-xl p-5 overflow-hidden",
        className
      )}
    >
      {/* Left accent bar */}
      <div className={cn("stat-accent-bar", colors.bar)} />

      <div className="flex items-start justify-between gap-4 pl-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            {label}
          </p>
          <p className="text-2xl font-display font-bold text-foreground leading-none">
            {value}
          </p>
          {change && (
            <div
              className={cn(
                "mt-2.5 flex items-center gap-1 text-xs font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
              {changeType === "negative" && (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("rounded-lg p-2.5 shrink-0", colors.icon)}>
            <Icon className="h-4.5 w-4.5" style={{ width: "1.125rem", height: "1.125rem" }} />
          </div>
        )}
      </div>
    </motion.div>
  );
};
