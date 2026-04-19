import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Role } from "@/components/RoleSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ArrowLeft, Mail, GraduationCap, Sparkles, AlertTriangle, UserCog } from "lucide-react";
import { FacultyAPI, PlacementAPI, AssessmentAPI } from "@/api";
import type { StudentRecord, PlacementDrive } from "@/data/mock";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
};

interface Props { role: Role }

const StudentProfile = ({ role }: Props) => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [drivesHistory, setDrivesHistory] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    Promise.all([
      FacultyAPI.studentById(id),
      PlacementAPI.drives(),
      AssessmentAPI.history() // Ideally filtered by student, but currently returns all attempts
    ]).then(([s, dList, attempts]) => {
      setStudent(s);
      setDrivesHistory(dList.filter(d => d.applicantIds.includes(id)));
      // Filter attempts for this student (assuming attempts has studentId or USN)
      setResults(attempts.filter((a: any) => a.userId === id || a.studentId === id).map((a: any) => ({
        id: a.id,
        title: a.assessment.title,
        date: new Date(a.createdAt).toLocaleDateString(),
        score: a.score
      })));
      setLoading(false);
    });
  }, [id]);

  if (loading || !student) {
    return (
      <DashboardLayout role={role} title="Student profile">
        <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
          {loading ? "Loading profile..." : "Student not found"}
        </div>
      </DashboardLayout>
    );
  }

  const back = role === "faculty" ? "/faculty/students" : "/placement/shortlist";

  return (
    <DashboardLayout role={role} title="Student profile" subtitle={`${student.roll} · ${student.branch}`}>
      <Link to={back} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 text-center">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-glow">
            {student.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
          </div>
          <h2 className="text-xl font-display font-bold mt-4">{student.name}</h2>
          <p className="text-sm text-muted-foreground">{student.roll} · {student.branch}</p>
          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{student.email}</div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div className="rounded bg-secondary/40 p-2"><span className="text-muted-foreground">CGPA</span><p className="font-display font-bold text-base">{student.cgpa || "N/A"}</p></div>
            <div className="rounded bg-secondary/40 p-2"><span className="text-muted-foreground">Readiness</span><p className="font-display font-bold text-base text-primary">{student.readiness}%</p></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold mb-2">Skill profile</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Insufficient assessment data for radar visualization.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold mb-2">Readiness trend</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Insufficient history to show trend.</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Test history</h3>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No assessments taken yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium">Test</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 font-medium">{r.title}</td>
                    <td className="py-2 text-muted-foreground">{r.date}</td>
                    <td className="py-2 font-display font-semibold text-primary">{r.score?.toFixed(1) || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Training</h3>
          <p className="text-sm text-muted-foreground py-4">No training modules assigned.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Weak areas</h3>
          <div className="flex flex-wrap gap-2">
            {(student.weak || "").split(",").map((w) => w.trim()).filter(Boolean).map((w) => (
              <Badge key={w} className="bg-warning/15 text-warning border-warning/30">{w}</Badge>
            ))}
          </div>
          {!student.weak && <p className="text-xs text-muted-foreground mt-2">No weak areas identified yet.</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold mb-3">Drive participation</h3>
          {drivesHistory.length === 0 && <p className="text-sm text-muted-foreground">No drive participation yet.</p>}
          <div className="space-y-2">
            {drivesHistory.map((d) => {
              const status = d.applicantStatus[id as string] ?? "Applied";
              return (
                <div key={d.id} className="flex items-center justify-between rounded-lg bg-secondary/40 p-3 text-sm">
                  <div>
                    <p className="font-medium">Drive · {new Date(d.date).toLocaleDateString()}</p>
                    <p className="text-[11px] text-muted-foreground">{d.venue}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">{status}</Badge>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
