import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Users, TrendingUp, AlertTriangle, Trophy, Search, ArrowUpRight, Upload as UploadIcon, CalendarDays, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { FacultyAPI } from "@/api";
import { toast } from "sonner";
import type { StudentRecord, FacultyMember } from "@/data/mock";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "var(--shadow-elevated)",
};

const FacultyDashboard = () => {
  const [me, setMe] = useState<FacultyMember | null>(null);
  const [allStudents, setAllStudents] = useState<StudentRecord[]>([]);
  const [batchPerf, setBatchPerf] = useState<Awaited<ReturnType<typeof FacultyAPI.batchPerformance>>>([]);
  const [gaps, setGaps] = useState<Awaited<ReturnType<typeof FacultyAPI.skillGaps>>>([]);
  const [batch, setBatch] = useState("CSE-A");
  const [search, setSearch] = useState("");
  const [scopeMentees, setScopeMentees] = useState(true);

  useEffect(() => {
    FacultyAPI.me().then(setMe);
    FacultyAPI.students().then(setAllStudents);
    FacultyAPI.batchPerformance().then(setBatchPerf);
    FacultyAPI.skillGaps().then(setGaps);
  }, []);

  const inScope = useMemo(() => {
    if (!me) return [];
    return scopeMentees
      ? allStudents.filter((s) => me.menteeIds.includes(s.id))
      : allStudents.filter((s) => s.subjects.some((sub) => me.subjects.includes(sub)));
  }, [allStudents, me, scopeMentees]);

  const filtered = inScope.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll.toLowerCase().includes(search.toLowerCase()),
  );

  const atRisk = inScope.filter((s) => s.readiness < 60).length;
  const top = inScope.filter((s) => s.readiness >= 80).length;
  const avg = inScope.length ? Math.round(inScope.reduce((a, s) => a + s.readiness, 0) / inScope.length) : 0;

  return (
    <DashboardLayout
      role="faculty"
      title={me ? `Hi, ${me.name.split(" ").slice(-1)[0]} 👋` : "Faculty workspace"}
      subtitle={me ? `Subjects: ${me.subjects.join(", ")} · ${me.menteeIds.length} mentees` : ""}
      actions={
        <>
          <Link to="/faculty/schedule"><Button variant="outline" size="sm"><CalendarDays className="h-4 w-4 mr-2" />Schedule test</Button></Link>
        </>
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={scopeMentees ? "mentees" : "subjects"} onValueChange={(v) => setScopeMentees(v === "mentees")}>
            <SelectTrigger className="w-44 bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mentees">My mentees</SelectItem>
              <SelectItem value="subjects">My subjects</SelectItem>
            </SelectContent>
          </Select>
          <Select value={batch} onValueChange={setBatch}>
            <SelectTrigger className="w-40 bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {batchPerf.map((b) => <SelectItem key={b.batch} value={b.batch}>{b.batch}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="In scope" value={inScope.length} change={scopeMentees ? "Your mentees" : "Your subjects"} delay={0} />
        <StatCard icon={TrendingUp} label="Avg Readiness" value={`${avg}%`} change="+6% MoM" changeType="positive" delay={0.1} />
        <StatCard icon={Trophy} label="Top performers" value={top} change="Score ≥ 80%" changeType="positive" delay={0.15} />
        <StatCard icon={AlertTriangle} label="At risk" value={atRisk} change="Score < 60%" changeType="negative" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-xl p-6 lg:col-span-2"
        >
          <h3 className="font-display font-semibold mb-1">Batch comparison</h3>
          <p className="text-xs text-muted-foreground mb-4">Average scores by skill area</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchPerf} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="batch" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--primary) / 0.06)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                <Bar dataKey="apt" name="Aptitude" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} animationDuration={900} />
                <Bar dataKey="code" name="Coding" fill="hsl(var(--primary-glow))" radius={[6, 6, 0, 0]} animationDuration={900} />
                <Bar dataKey="core" name="Core" fill="hsl(var(--info))" radius={[6, 6, 0, 0]} animationDuration={900} />
                <Bar dataKey="soft" name="Soft" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} animationDuration={900} />
              </BarChart>
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
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-semibold">Curriculum Gap Matrix</h3>
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-destructive border-destructive/20 bg-destructive/5 animate-pulse">Critical Gaps</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-6">Real-time departmental failure correlation by topic</p>
          
          <div className="space-y-6">
            {[
              { topic: "Pointer Arithmetic", rate: 74, impact: "+8%", color: "hsl(var(--destructive))" },
              { topic: "DBMS Normalization", rate: 58, impact: "+5%", color: "hsl(var(--warning))" },
              { topic: "System Design (L1)", rate: 42, impact: "+3%", color: "hsl(var(--info))" },
              { topic: "Process Scheduling", rate: 31, impact: "+2%", color: "hsl(var(--primary))" }
            ].map((g, i) => (
              <div key={g.topic} className="group cursor-default">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-xs font-bold text-foreground block">{g.topic}</span>
                    <span className="text-[10px] text-muted-foreground">Failure Rate: <span className="text-white">{g.rate}%</span></span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-success font-bold">{g.impact} Readiness Lift</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${g.rate}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: g.color }}
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-[10px] font-bold border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => toast.success(`Cleanup session scheduled for ${g.topic}. Invitations sent to ${Math.round(inScope.length * (g.rate/100))} students.`)}
                  >
                    Schedule Review
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <Sparkles className="h-3 w-3 inline mr-1 text-primary" />
              AI Insight: <span className="text-white font-medium">Pointer Arithmetic</span> is currently dragging down the department's technical readiness by <span className="text-primary font-bold">12 points</span>.
            </p>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-display font-semibold">{scopeMentees ? "My mentees" : "Students in my subjects"}</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or roll no..."
              className="pl-9 bg-secondary/50"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Roll No</th>
                <th className="pb-3 font-medium">Readiness</th>
                <th className="pb-3 font-medium hidden md:table-cell">CGPA</th>
                <th className="pb-3 font-medium hidden md:table-cell">Weak Areas</th>
                <th className="pb-3 font-medium hidden lg:table-cell">Last Active</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No students match.</td></tr>
              )}
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 font-medium">{s.name}</td>
                  <td className="py-3 text-muted-foreground">{s.roll}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold">{s.readiness}%</span>
                      <div className={`h-2 w-2 rounded-full ${s.readiness >= 80 ? "bg-success" : s.readiness >= 60 ? "bg-info" : "bg-destructive"}`} />
                    </div>
                  </td>
                  <td className="py-3 hidden md:table-cell">{s.cgpa}</td>
                  <td className="py-3 text-muted-foreground hidden md:table-cell">{s.weak}</td>
                  <td className="py-3 text-muted-foreground hidden lg:table-cell">{s.active}</td>
                  <td className="py-3 text-right">
                    <Link to={`/faculty/students/${s.id}`}>
                      <Button variant="ghost" size="sm" className="text-primary">
                        View <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
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

export default FacultyDashboard;
