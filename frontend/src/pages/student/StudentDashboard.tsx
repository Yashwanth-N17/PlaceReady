import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ReadinessRing } from "@/components/ReadinessRing";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  BookOpen, Trophy, TrendingUp, Sparkles, ArrowUpRight, AlertTriangle, Calendar, Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { StudentAPI } from "@/api";
import { cn } from "@/lib/utils";

/* ── Recharts tooltip style ── */
const tooltipStyle = {
  background: "hsl(224 20% 9%)",
  border: "1px solid hsl(224 14% 18%)",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(220 14% 90%)",
  boxShadow: "0 8px 24px hsl(0 0% 0% / 0.4)",
  padding: "8px 12px",
};

const labelStyle = { color: "hsl(220 10% 60%)", fontSize: 11 };

/* ── Chart palette ── */
const CHART = {
  aptitude: "#818cf8",  // indigo-400
  coding:   "#a78bfa",  // violet-400
  core:     "#38bdf8",  // sky-400
  soft:     "#34d399",  // emerald-400
};

const StudentDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  const fetchDashboard = () => StudentAPI.dashboard().then(setData);

  useEffect(() => {
    StudentAPI.me().then(setUser);
    fetchDashboard();
    StudentAPI.tests().then(setTests);
    StudentAPI.results().then(setResults);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await StudentAPI.refreshReadiness();
      await fetchDashboard();
    } finally {
      setSyncing(false);
    }
  };

  const upcoming = tests.filter((t) => t.status === "upcoming").slice(0, 3);
  const recent = results.slice(0, 4);

  return (
    <DashboardLayout
      role="student"
      title={`Welcome back, ${user && user.name ? user.name.split(" ")[0] : "Student"}`}
      subtitle="Here's your placement readiness overview."
      actions={
        <Button 
          size="sm" 
          onClick={handleSync} 
          disabled={syncing}
          className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
        >
          <Sparkles className={cn("h-4 w-4 mr-2", syncing && "animate-spin")} />
          {syncing ? "Syncing..." : "Sync with Gemini"}
        </Button>
      }
    >
      {/* AI Feedback Banner */}
      {data?.profile?.aiFeedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-start gap-4 shadow-glow"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">AI Growth Strategy</h4>
              <Badge variant="outline" className="text-[9px] h-4 border-primary/20 bg-primary/10 text-primary px-1.5">Personalized</Badge>
            </div>
            <p className="text-sm text-foreground/90 font-medium leading-relaxed italic">
              "{data.profile.aiFeedback}"
            </p>
          </div>
        </motion.div>
      )}
      {/* ── Top row: Ring + Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-xl p-6 flex flex-col items-center justify-center gap-3"
        >
          <ReadinessRing value={data?.stats?.readiness ?? 0} />
          <div className="text-center">
            <Badge className="bg-success/10 text-success border-success/20 text-xs font-medium">
              Real-time Readiness
            </Badge>
            <p className="text-xs text-muted-foreground mt-2 max-w-[180px]">
              AI-calculated based on your history.
            </p>
          </div>
        </motion.div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard
            icon={BookOpen}
            label="Tests taken"
            value={results.length.toString()}
            change="Keep it up!"
            changeType="neutral"
            delay={0.05}
            accent="primary"
          />
          <StatCard
            icon={Trophy}
            label="Avg score"
            value={`${results.length > 0 ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length) : 0}%`}
            change="Overall accuracy"
            changeType="positive"
            delay={0.1}
            accent="success"
          />
          <StatCard
            icon={TrendingUp}
            label="Tests upcoming"
            value={upcoming.length.toString()}
            change="Ready for next?"
            changeType="neutral"
            delay={0.15}
            accent="info"
          />
          <StatCard
            icon={Sparkles}
            label="Prep Score"
            value={(data?.stats?.readiness ?? 0).toString()}
            change="Data-backed"
            changeType="neutral"
            delay={0.2}
            accent="warning"
          />
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Skills line/area chart */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-xl p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">Skills Progression</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.skillsOverTime ?? []}
                margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
              >
                <defs>
                  {Object.entries(CHART).map(([key, color]) => (
                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 14% 14%)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="hsl(220 10% 40%)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={4}
                />
                <YAxis
                  stroke="hsl(220 10% 40%)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={labelStyle}
                  cursor={{ stroke: "hsl(224 14% 22%)", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 10, color: "hsl(220 10% 60%)" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area type="monotone" dataKey="aptitude" name="Aptitude" stroke={CHART.aptitude} fill={`url(#grad-aptitude)`} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="coding" name="Coding" stroke={CHART.coding} fill={`url(#grad-coding)`} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="core" name="Core CS" stroke={CHART.core} fill={`url(#grad-core)`} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="soft" name="Soft Skills" stroke={CHART.soft} fill={`url(#grad-soft)`} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Radar chart */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card rounded-xl p-5"
        >
          <h3 className="font-display font-semibold text-foreground">Skill Profile</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">Readiness by area</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data?.skillRadar ?? []}>
                <PolarGrid stroke="hsl(224 14% 16%)" />
                <PolarAngleAxis
                  dataKey="skill"
                  stroke="hsl(220 10% 50%)"
                  fontSize={10}
                  tick={{ fill: "hsl(220 10% 55%)" }}
                />
                <PolarRadiusAxis
                  stroke="hsl(224 14% 16%)"
                  fontSize={9}
                  tick={{ fill: "hsl(220 10% 40%)" }}
                />
                <Radar
                  name="You"
                  dataKey="value"
                  stroke={CHART.aptitude}
                  fill={CHART.aptitude}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ── Weak areas + Upcoming ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-xl p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <h3 className="font-display font-semibold text-foreground">Focus Areas</h3>
            </div>
            <Link to="/student/training">
              <Button variant="ghost" size="sm" className="text-primary h-7 text-xs hover:bg-primary/8">
                View training →
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {(data?.weakAreas ?? []).map((w, i) => (
              <motion.div
                key={w.topic}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 hover:border-primary/30 hover:bg-muted/50 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-medium text-sm text-foreground truncate">{w.topic}</span>
                    <span className="text-[10px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5 shrink-0">
                      {w.category}
                    </span>
                  </div>
                  <Progress value={w.score} className="h-1.5 bg-muted" />
                  <p className="text-[11px] text-muted-foreground mt-1">{w.score}% mastery</p>
                </div>
                <Link to="/student/training">
                  <Button size="sm" className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all h-8 text-xs shrink-0">
                    Train <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming tests */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Upcoming</h3>
            </div>
            <Link to="/student/tests" className="text-xs text-primary hover:underline">All →</Link>
          </div>
          <div className="space-y-2.5">
            {upcoming.map((t) => (
              <Link to="/student/tests" key={t.id} className="block group">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 hover:border-primary/30 hover:bg-muted/40 transition-all">
                  <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{t.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{new Date(t.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{t.durationMin}m
                    </span>
                  </div>
                  <span className="inline-block mt-2 text-[10px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">
                    {t.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Recent results table ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-xl p-5"
      >
        <h3 className="font-display font-semibold text-foreground mb-4">Recent Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Test
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Score
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Percentile
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 font-medium text-foreground">{r.title}</td>
                  <td className="py-3 text-muted-foreground text-sm">{r.date}</td>
                  <td className="py-3 font-display font-semibold text-foreground">{r.score}%</td>
                  <td className="py-3 text-muted-foreground hidden md:table-cell">{r.percentile}th</td>
                  <td className="py-3">
                    <span
                      className={
                        r.status === "Excellent"
                          ? "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-success/10 text-success ring-1 ring-success/20"
                          : r.status === "Good"
                          ? "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-info/10 text-info ring-1 ring-info/20"
                          : "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-warning/10 text-warning ring-1 ring-warning/20"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
