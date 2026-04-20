import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Role } from "@/components/RoleSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft, Mail, GraduationCap, Sparkles, AlertTriangle, ShieldCheck,
  EyeOff, Activity, BookOpen, Trophy
} from "lucide-react";
import { FacultyAPI, PlacementAPI } from "@/api";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
};

interface Props { role: Role }

const DisciplineRing = ({ score, label }: { score: number; label: string }) => {
  const color = score >= 90 ? "text-success" : score >= 75 ? "text-primary" : score >= 55 ? "text-warning" : "text-destructive";
  const strokeColor = score >= 90 ? "#34d399" : score >= 75 ? "#818cf8" : score >= 55 ? "#f59e0b" : "#f87171";
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-36 w-36">
        <svg className="rotate-[-90deg]" viewBox="0 0 120 120" width="144" height="144">
          <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={strokeColor} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-display font-bold text-2xl", color)}>{score}</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className={cn("text-xs font-bold uppercase tracking-widest", color)}>{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Professional Discipline</p>
      </div>
    </div>
  );
};

const StudentProfile = ({ role }: Props) => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    FacultyAPI.studentById(id).then(s => {
      setStudent(s);
      setLoading(false);
    });
  }, [id]);

  if (loading || !student) {
    return (
      <DashboardLayout role={role} title="Student profile">
        <div className="glass-card rounded-xl p-12 text-center text-muted-foreground animate-pulse">
          {loading ? "Loading profile..." : "Student not found"}
        </div>
      </DashboardLayout>
    );
  }

  const back = role === "faculty" ? "/faculty" : "/placement/shortlist";
  const attempts = student.attempts || [];

  // Build score history for line chart
  const scoreHistory = attempts.slice().reverse().map((a: any, i: number) => ({
    attempt: `#${i + 1}`,
    score: a.score,
    focusLoss: a.focusLossCount,
  }));

  const disciplineScore: number = student.disciplineScore ?? 100;
  const disciplineLabel: string = student.disciplineLabel ?? "Exceptional";
  const totalFocusLoss: number = student.totalFocusLoss ?? 0;

  return (
    <DashboardLayout role={role} title="Student Profile" subtitle={`${student.roll} · ${student.branch}`}>
      <Link to={back} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 gap-1 group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back
      </Link>

      {/* ── Top Row: Identity + Discipline + Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Identity card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 text-center flex flex-col items-center">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-glow">
            {student.name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <h2 className="text-xl font-display font-bold mt-4">{student.name}</h2>
          <p className="text-sm text-muted-foreground">{student.roll} · {student.branch}</p>
          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />{student.email}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 w-full text-xs">
            <div className="rounded-xl bg-secondary/40 p-3 border border-border/30">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block mb-1">CGPA</span>
              <p className="font-display font-bold text-lg">{student.cgpa || "N/A"}</p>
            </div>
            <div className="rounded-xl bg-secondary/40 p-3 border border-border/30">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block mb-1">Readiness</span>
              <p className="font-display font-bold text-lg text-primary">{student.readiness}%</p>
            </div>
          </div>
        </motion.div>

        {/* ── Behavioral Benchmarking Card ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-card rounded-xl p-6 flex flex-col items-center justify-between border border-primary/5"
        >
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Behavioral Benchmarking
            </h3>
            <Badge variant="outline" className="text-[9px] bg-primary/5 border-primary/20 text-primary">Proctoring Data</Badge>
          </div>

          <DisciplineRing score={disciplineScore} label={disciplineLabel} />

          <div className="w-full space-y-3 mt-4">
            <div className="flex items-center justify-between text-xs bg-secondary/30 rounded-lg px-3 py-2 border border-border/30">
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <EyeOff className="h-3.5 w-3.5" /> Total Focus Events
              </span>
              <span className={cn("font-bold", totalFocusLoss === 0 ? "text-success" : totalFocusLoss <= 3 ? "text-warning" : "text-destructive")}>
                {totalFocusLoss} tab switches
              </span>
            </div>
            <div className="flex items-center justify-between text-xs bg-secondary/30 rounded-lg px-3 py-2 border border-border/30">
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <Activity className="h-3.5 w-3.5" /> Tests Completed
              </span>
              <span className="font-bold">{student.assessmentsAttempted || attempts.length}</span>
            </div>
            <p className="text-[10px] text-muted-foreground text-center italic">
              Score calculated from tab-switch frequency across all proctored assessments.
            </p>
          </div>
        </motion.div>

        {/* AI Feedback + quick stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 space-y-4"
        >
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" /> AI Growth Strategy
          </h3>
          {student.aiFeedback ? (
            <div className="bg-primary/5 rounded-xl border border-primary/10 p-4">
              <p className="text-sm text-foreground/80 leading-relaxed italic">"{student.aiFeedback}"</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No AI analysis yet — student needs to complete at least one assessment.</p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: BookOpen, label: "Tests taken", value: attempts.length, color: "text-primary" },
              { icon: Trophy, label: "Best score", value: attempts.length > 0 ? `${Math.max(...attempts.map((a: any) => a.score || 0)).toFixed(0)}%` : "—", color: "text-success" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-xl bg-secondary/30 p-3 border border-border/30 text-center">
                <Icon className={cn("h-4 w-4 mx-auto mb-1", color)} />
                <p className="font-display font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Score History Chart ── */}
      {scoreHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-xl p-6 mb-6">
          <h3 className="font-display font-semibold mb-1">Score & Focus History</h3>
          <p className="text-xs text-muted-foreground mb-4">Assessment score alongside focus-loss events per attempt</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreHistory} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="attempt" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="score" name="Score %" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 4, fill: "#818cf8" }} />
                <Line type="monotone" dataKey="focusLoss" name="Focus Events" stroke="#f87171" strokeWidth={2} dot={{ r: 3, fill: "#f87171" }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ── Test History Table ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border/40">
          <h3 className="font-display font-semibold flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Assessment History</h3>
        </div>
        {attempts.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No assessments taken yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4 text-left font-bold">Assessment</th>
                <th className="px-6 py-4 text-left font-bold">Date</th>
                <th className="px-6 py-4 text-left font-bold">Score</th>
                <th className="px-6 py-4 text-left font-bold">Focus Events</th>
                <th className="px-6 py-4 text-left font-bold">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {attempts.map((a: any) => (
                <tr key={a.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-medium">{a.title}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={cn("font-display font-bold",
                      a.score >= 80 ? "text-success" : a.score >= 60 ? "text-primary" : "text-destructive"
                    )}>{a.score?.toFixed(1) ?? 0}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                      a.focusLossCount === 0 ? "bg-success/10 text-success" :
                      a.focusLossCount <= 2 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                    )}>
                      {a.focusLossCount} {a.focusLossCount === 0 ? "✓ Clean" : "events"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={cn("text-[10px]",
                      a.score >= 80 ? "border-success/30 text-success bg-success/5" :
                      a.score >= 60 ? "border-primary/30 text-primary bg-primary/5" :
                      "border-destructive/30 text-destructive bg-destructive/5"
                    )}>
                      {a.score >= 80 ? "Excellent" : a.score >= 60 ? "Good" : "Needs Work"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default StudentProfile;
