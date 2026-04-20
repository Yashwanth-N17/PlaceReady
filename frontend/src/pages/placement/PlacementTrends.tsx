import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, AreaChart, Area
} from "recharts";
import { TrendingUp, Calendar, Zap, Sparkles } from "lucide-react";
import { ReportsAPI } from "@/api";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
};

const PlacementTrends = () => {
  const [monthly, setMonthly] = useState<any[]>([]);
  const [yoy, setYoy] = useState<any[]>([]);

  useEffect(() => {
    ReportsAPI.monthlyReadiness().then(setMonthly);
    ReportsAPI.yearOverYear().then(setYoy);
  }, []);

  return (
    <DashboardLayout
      role="placement"
      title="Placement Trends"
      subtitle="Historical growth, monthly readiness progression, and year-over-year analytics."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Monthly Readiness
              </h3>
              <p className="text-xs text-muted-foreground">Progression of average readiness scores across branches</p>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Live Sync</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                <Line type="monotone" dataKey="batchA" name="CSE-A" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--background))" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="batchB" name="CSE-B" stroke="hsl(var(--primary-glow))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--background))" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="ece" name="ECE" stroke="hsl(var(--success))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--background))" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" /> YoY Placements
              </h3>
              <p className="text-xs text-muted-foreground">Historical placement rates and average CTC levels</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yoy} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--primary) / 0.06)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                <Bar dataKey="placementRate" name="Placement %" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={40} />
                <Bar dataKey="avgCtc" name="Avg CTC (LPA)" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/10 overflow-hidden relative"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold">Projected Readiness</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mb-6">
            Based on current training velocity and assessment performance, the 2025 batch is on track to reach an average readiness score of <strong className="text-foreground">84%</strong> by June, reflecting a <strong className="text-success">12% growth</strong> compared to last year.
          </p>
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-lg bg-background/50 border border-border">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Target</span>
              <p className="text-lg font-bold">85%</p>
            </div>
            <div className="px-4 py-2 rounded-lg bg-background/50 border border-border">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Growth</span>
              <p className="text-lg font-bold text-success">+12.4%</p>
            </div>
          </div>
        </div>
        <TrendingUp className="absolute -bottom-10 -right-10 h-64 w-64 text-primary/5 -rotate-12" />
      </motion.div>
    </DashboardLayout>
  );
};

const Badge = ({ children, variant, className }: any) => (
  <span className={cn(
    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
    variant === "outline" ? "bg-transparent" : "bg-primary text-primary-foreground",
    className
  )}>
    {children}
  </span>
);

export default PlacementTrends;
