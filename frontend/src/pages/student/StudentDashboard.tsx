import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ReadinessRing } from "@/components/ReadinessRing";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  BookOpen, Trophy, TrendingUp, Sparkles, ArrowUpRight, AlertTriangle, Calendar, Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { StudentAPI } from "@/api";
import { currentUser } from "@/data/mock";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "var(--shadow-elevated)",
};

const StudentDashboard = () => {
  const [data, setData] = useState<Awaited<ReturnType<typeof StudentAPI.dashboard>> | null>(null);
  const [tests, setTests] = useState<Awaited<ReturnType<typeof StudentAPI.tests>>>([]);
  const [results, setResults] = useState<Awaited<ReturnType<typeof StudentAPI.results>>>([]);

  useEffect(() => {
    StudentAPI.dashboard().then(setData);
    StudentAPI.tests().then(setTests);
    StudentAPI.results().then(setResults);
  }, []);

  const upcoming = tests.filter((t) => t.status === "upcoming").slice(0, 3);
  const recent = results.slice(0, 4);

  return (
    <DashboardLayout
      role="student"
      title={`Hi, ${currentUser.name.split(" ")[0]} 👋`}
      subtitle="Here's a snapshot of your placement readiness."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-xl p-6 flex flex-col items-center justify-center"
        >
          <ReadinessRing value={data?.readiness ?? 76} />
          <Badge className="mt-4 bg-success/15 text-success border-success/30 hover:bg-success/20">
            Excellent · Top 18%
          </Badge>
          <p className="text-xs text-muted-foreground mt-2 text-center max-w-xs">
            You're tracking 12 points above your batch average.
          </p>
        </motion.div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard icon={BookOpen} label="Tests Taken" value="24" change="+3 this week" changeType="positive" delay={0.1} />
          <StatCard icon={Trophy} label="Average Score" value="76%" change="+5%" changeType="positive" delay={0.15} />
          <StatCard icon={TrendingUp} label="Class Rank" value="#47" change="↑ 8 positions" changeType="positive" delay={0.2} />
          <StatCard icon={Sparkles} label="Streak" value="12d" change="Keep it up" changeType="neutral" delay={0.25} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Skills progression</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.skillsOverTime ?? []} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: 4 }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
                <Line type="monotone" dataKey="aptitude" name="Aptitude" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} animationDuration={1200} />
                <Line type="monotone" dataKey="coding" name="Coding" stroke="hsl(var(--primary-glow))" strokeWidth={2.5} dot={false} animationDuration={1200} />
                <Line type="monotone" dataKey="core" name="Core CS" stroke="hsl(var(--info))" strokeWidth={2.5} dot={false} animationDuration={1200} />
                <Line type="monotone" dataKey="soft" name="Soft Skills" stroke="hsl(var(--success))" strokeWidth={2.5} dot={false} animationDuration={1200} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="font-display font-semibold mb-1">Skill profile</h3>
          <p className="text-xs text-muted-foreground mb-2">Your readiness by area</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data?.skillRadar ?? []}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="skill" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <PolarRadiusAxis stroke="hsl(var(--border))" fontSize={9} />
                <Radar name="You" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} animationDuration={1200} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <h3 className="font-display font-semibold">Weak areas to focus on</h3>
            </div>
            <Link to="/student/training">
              <Button variant="ghost" size="sm" className="text-primary">View training</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {(data?.weakAreas ?? []).map((w, i) => (
              <motion.div
                key={w.topic}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-lg border border-border bg-secondary/30 p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{w.topic}</span>
                      <Badge variant="outline" className="text-[10px]">{w.category}</Badge>
                    </div>
                    <Progress value={w.score} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">{w.score}% mastery</p>
                  </div>
                  <Link to="/student/training">
                    <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shrink-0">
                      Train <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold">Upcoming</h3>
            </div>
            <Link to="/student/tests" className="text-xs text-primary hover:underline">All →</Link>
          </div>
          <div className="space-y-3">
            {upcoming.map((t) => (
              <Link to="/student/tests" key={t.id} className="block">
                <div className="rounded-lg border border-border bg-secondary/30 p-3 hover:border-primary/40 transition-colors">
                  <p className="font-medium text-sm">{t.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(t.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.durationMin}m</span>
                  </div>
                  <Badge variant="outline" className="mt-2 text-[10px]">{t.type}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="font-display font-semibold mb-4">Recent results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">Test</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium hidden md:table-cell">Percentile</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 font-medium">{r.title}</td>
                  <td className="py-3 text-muted-foreground">{r.date}</td>
                  <td className="py-3 font-display font-semibold">{r.score}%</td>
                  <td className="py-3 text-muted-foreground hidden md:table-cell">{r.percentile}th</td>
                  <td className="py-3">
                    <Badge className={
                      r.status === "Excellent" ? "bg-success/15 text-success border-success/30 hover:bg-success/20" :
                      r.status === "Good" ? "bg-info/15 text-info border-info/30 hover:bg-info/20" :
                      "bg-warning/15 text-warning border-warning/30 hover:bg-warning/20"
                    }>
                      {r.status}
                    </Badge>
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
