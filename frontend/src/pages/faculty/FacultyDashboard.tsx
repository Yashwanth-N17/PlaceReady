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
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import {
  Users, TrendingUp, AlertTriangle, Trophy, Search, ArrowUpRight,
  CalendarDays, Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FacultyAPI } from "@/api";
import { toast } from "sonner";
import type { StudentRecord, FacultyMember } from "@/data/mock";

/* ── Chart styles ── */
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

const BAR_COLORS = {
  apt:  "#818cf8",
  code: "#a78bfa",
  core: "#38bdf8",
  soft: "#34d399",
};

/* ── Readiness badge ── */
function ReadinessTag({ value }: { value: number }) {
  if (value >= 80)
    return (
      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-success/10 text-success ring-1 ring-success/20">
        {value}%
      </span>
    );
  if (value >= 60)
    return (
      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-info/10 text-info ring-1 ring-info/20">
        {value}%
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive ring-1 ring-destructive/20">
      {value}%
    </span>
  );
}

const FacultyDashboard = () => {
  const [me, setMe] = useState<FacultyMember | null>(null);
  const [allStudents, setAllStudents] = useState<StudentRecord[]>([]);
  const [batchPerf, setBatchPerf] = useState<Awaited<ReturnType<typeof FacultyAPI.batchPerformance>>>([]);
  const [gaps, setGaps] = useState<Awaited<ReturnType<typeof FacultyAPI.skillGaps>>>([]);
  const [batch, setBatch] = useState("CSE-A");
  const [search, setSearch] = useState("");
  const [scopeMentees, setScopeMentees] = useState(true);

  useEffect(() => {
    FacultyAPI.me().then(data => {
      console.log("FacultyAPI.me returned:", data);
      setMe(data);
    });
    FacultyAPI.students().then(setAllStudents);
    FacultyAPI.batchPerformance().then(setBatchPerf);
    FacultyAPI.skillGaps().then(setGaps);
  }, []);

  const inScope = useMemo(() => {
    if (!me) return [];
    if (scopeMentees) {
      return allStudents.filter((s) => (me as any).menteeIds?.includes(s.roll) || (me as any).menteeIds?.includes(s.id) || true);
    }
    return allStudents;
  }, [allStudents, me, scopeMentees]);

  const filtered = inScope.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.roll || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase()),
  );

  const atRisk = inScope.filter((s) => s.readiness < 60).length;
  const top = inScope.filter((s) => s.readiness >= 80).length;
  const avg = inScope.length
    ? Math.round(inScope.reduce((a, s) => a + s.readiness, 0) / inScope.length)
    : 0;

  return (
    <DashboardLayout
      role="faculty"
      title={me && me.name ? `Welcome back, Prof. ${me.name.split(" ").slice(-1)[0]}` : "Faculty Workspace"}
      subtitle={me ? `${(me as any).department || "CSE"} Department` : "Manage your students and assessments"}
      actions={
        <Link to="/faculty/schedule">
          <Button variant="outline" size="sm" className="h-8 text-xs border-border/60 hover:border-primary/40">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            Schedule test
          </Button>
        </Link>
      }
    >
      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <Select value={scopeMentees ? "mentees" : "subjects"} onValueChange={(v) => setScopeMentees(v === "mentees")}>
          <SelectTrigger className="w-44 h-8 bg-muted/40 border-border/60 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mentees">My mentees</SelectItem>
            <SelectItem value="subjects">All students</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard icon={Users} label="Total Students" value={inScope.length} change="In current scope" delay={0} accent="primary" />
        <StatCard icon={TrendingUp} label="Avg readiness" value={`${avg}%`} change="Class average" delay={0.05} accent="success" />
        <StatCard icon={Trophy} label="Top performers" value={top} change="Score ≥ 80%" delay={0.1} accent="info" />
        <StatCard icon={AlertTriangle} label="At risk" value={atRisk} change="Score < 60%" delay={0.15} accent="destructive" />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-xl p-5 lg:col-span-2"
        >
          <h3 className="font-display font-semibold text-foreground">Batch Comparison</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-4">Average scores by skill area</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchPerf} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 14% 14%)" vertical={false} />
                <XAxis
                  dataKey="batch"
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
                  cursor={{ fill: "hsl(224 14% 14%)" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 10, color: "hsl(220 10% 60%)" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="apt" name="Aptitude" fill={BAR_COLORS.apt} radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="code" name="Coding" fill={BAR_COLORS.code} radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="core" name="Core CS" fill={BAR_COLORS.core} radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="soft" name="Soft Skills" fill={BAR_COLORS.soft} radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gap matrix */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-display font-semibold text-foreground">Curriculum Gaps</h3>
              <p className="text-xs text-muted-foreground mt-0.5 mb-4">Failure rate by topic</p>
            </div>
            <span className="text-[10px] font-semibold uppercase text-destructive bg-destructive/10 border border-destructive/20 rounded px-1.5 py-0.5 shrink-0">
              Critical
            </span>
          </div>

          <div className="space-y-4">
            {gaps.length === 0 && (
              <p className="text-xs text-muted-foreground py-8 text-center italic">No critical gaps identified yet.</p>
            )}
            {gaps.map((g, i) => (
              <div key={g.topic} className="group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-foreground">{g.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-success font-medium">-{g.failRate}% fix</span>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: "hsl(var(--destructive))" }}
                    >
                      {g.failRate}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${g.failRate}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                    className="h-full rounded-full bg-destructive"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg bg-primary/5 border border-primary/10 p-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <Sparkles className="h-3 w-3 inline mr-1 text-primary" />
              <span className="text-foreground font-medium">AI Insight:</span>{" "}
              Pointer Arithmetic drags technical readiness down by{" "}
              <span className="text-primary font-semibold">12 pts</span>.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Students table ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-xl p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-display font-semibold text-foreground">
            {scopeMentees ? "My Mentees" : "Students in My Subjects"}
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or roll no..."
              className="pl-9 h-8 bg-muted/40 border-border/60 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                {["Name", "Roll No", "Readiness", "CGPA", "Weak Areas", "Last Active", ""].map((h) => (
                  <th
                    key={h}
                    className={`pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground ${h === "CGPA" || h === "Weak Areas" ? "hidden md:table-cell" : ""} ${h === "Last Active" ? "hidden lg:table-cell" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground text-sm">
                    No students found.
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/25 transition-colors"
                >
                  <td className="py-3 font-medium text-foreground">{s.name}</td>
                  <td className="py-3 text-muted-foreground font-mono text-xs">{s.roll}</td>
                  <td className="py-3">
                    <ReadinessTag value={s.readiness} />
                  </td>
                  <td className="py-3 text-muted-foreground hidden md:table-cell">{s.cgpa}</td>
                  <td className="py-3 text-muted-foreground text-xs hidden md:table-cell">{s.weak}</td>
                  <td className="py-3 text-muted-foreground text-xs hidden lg:table-cell">{s.active}</td>
                  <td className="py-3 text-right">
                    <Link to={`/faculty/students/${s.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/8">
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
