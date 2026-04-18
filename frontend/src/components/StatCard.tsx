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
}

export const StatCard = ({ icon: Icon, label, value, change, changeType = "neutral", delay = 0, className }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className={cn(
        "glass-card rounded-xl p-5 hover:shadow-elevated transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-display font-semibold text-foreground">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {change && (
        <div className={cn(
          "mt-3 flex items-center gap-1 text-xs font-medium",
          changeType === "positive" && "text-success",
          changeType === "negative" && "text-destructive",
          changeType === "neutral" && "text-muted-foreground",
        )}>
          {changeType === "positive" && <TrendingUp className="h-3.5 w-3.5" />}
          {changeType === "negative" && <TrendingDown className="h-3.5 w-3.5" />}
          <span>{change}</span>
        </div>
      )}
    </motion.div>
  );
};
