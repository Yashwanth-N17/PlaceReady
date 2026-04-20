import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CalendarDays, MapPin, Briefcase, DollarSign, Building2, CheckCircle2, Clock, Users,
  AlertCircle, ShieldCheck, GraduationCap, Zap
} from "lucide-react";
import { PlacementAPI, StudentAPI } from "@/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: "bg-warning/15 text-warning border-warning/30",
  ACTIVE:   "bg-success/15 text-success border-success/30",
  COMPLETED:"bg-secondary/40 text-muted-foreground",
};

const StudentDrives = () => {
  const [drives, setDrives] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      PlacementAPI.drives(),
      StudentAPI.me()
    ]).then(([d, s]) => {
      setDrives(d);
      setStudent(s?.user);
      setLoading(false);
    });
  }, []);

  const apply = async (driveId: string) => {
    setApplying(driveId);
    try {
      await PlacementAPI.applyToDrive(driveId);
      setDrives(prev => prev.map(d => d.id === driveId ? { ...d, hasApplied: true, applicantCount: (d.applicantCount || 0) + 1 } : d));
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(null);
    }
  };

  const active  = drives.filter(d => d.status === "ACTIVE" || d.status === "UPCOMING");
  const closed  = drives.filter(d => d.status === "COMPLETED");

  const DriveCard = ({ d }: { d: any }) => {
    const studentProfile = student?.StudentProfile;
    const cgpa = studentProfile?.cgpa || 0;
    const readiness = studentProfile?.readinessScore || 0;

    const minCgpa = d.company?.minCgpa || 0;
    const minReadiness = d.company?.minReadiness || 0;

    const isEligibleCgpa = cgpa >= minCgpa;
    const isEligibleReadiness = readiness >= minReadiness;
    const isEligible = isEligibleCgpa && isEligibleReadiness;

    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "glass-card rounded-2xl p-6 flex flex-col gap-6 hover:shadow-glow transition-all border",
          d.hasApplied ? "border-success/20 bg-success/[0.02]" : "border-border/50"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-glow shrink-0">
              {(d.company?.name || "?")?.[0]}
            </div>
            <div>
              <p className="font-display font-bold text-lg text-foreground leading-tight">{d.company?.name || "Company"}</p>
              <div className="flex items-center gap-2 mt-1">
                 <Badge className={cn("text-[9px] h-4 uppercase tracking-widest", STATUS_COLORS[d.status] ?? STATUS_COLORS.UPCOMING)}>
                  {d.status?.toLowerCase()}
                </Badge>
                <Badge variant="outline" className="text-[9px] h-4 uppercase tracking-widest bg-secondary/30">{d.type?.replace("_", " ") || "Full Time"}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Banner */}
        {!d.hasApplied && d.status !== "COMPLETED" && (
          <div className={cn(
            "rounded-xl px-4 py-3 border flex items-center justify-between gap-3",
            isEligible ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn("p-1.5 rounded-lg", isEligible ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                {isEligible ? <ShieldCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              </div>
              <div className="text-[11px]">
                <p className={cn("font-bold uppercase tracking-wider mb-0.5", isEligible ? "text-success" : "text-destructive")}>
                  {isEligible ? "Eligible to Apply" : "Ineligible"}
                </p>
                <p className="text-muted-foreground">
                  Req: {minCgpa} CGPA & {minReadiness}% Readiness
                </p>
              </div>
            </div>
            {!isEligible && (
              <div className="flex gap-2">
                {!isEligibleCgpa && <Badge variant="outline" className="text-[9px] border-destructive/30 text-destructive bg-destructive/10">Low CGPA</Badge>}
                {!isEligibleReadiness && <Badge variant="outline" className="text-[9px] border-destructive/30 text-destructive bg-destructive/10">Low Score</Badge>}
              </div>
            )}
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <div className="flex flex-col gap-1">
             <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">Role</span>
             <span className="text-xs font-semibold flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-primary" />{d.role || "—"}</span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">Salary</span>
             <span className="text-xs font-semibold flex items-center gap-1.5 text-success"><DollarSign className="h-3.5 w-3.5" />{d.salary || "—"}</span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">Date & Location</span>
             <span className="text-xs font-semibold flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />{new Date(d.date).toLocaleDateString()}</span>
             {d.location && <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-5"><MapPin className="h-3 w-3" />{d.location}</span>}
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">Candidates</span>
             <span className="text-xs font-semibold flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-muted-foreground" />{d.applicantCount ?? 0} Applied</span>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <div className="flex gap-3">
             <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-muted-foreground">Min. CGPA</span>
                <span className={cn("text-xs font-bold", isEligibleCgpa ? "text-foreground" : "text-destructive")}>{minCgpa}</span>
             </div>
             <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-muted-foreground">Min. Scores</span>
                <span className={cn("text-xs font-bold", isEligibleReadiness ? "text-foreground" : "text-destructive")}>{minReadiness}%</span>
             </div>
          </div>

          <div className="shrink-0">
            {d.status === "COMPLETED" ? (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-secondary/40 px-3 py-1.5 rounded-lg"><Clock className="h-3.5 w-3.5" />Drive closed</span>
            ) : d.hasApplied ? (
              <Badge className="bg-success/10 text-success border-success/30 px-4 py-1.5 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Application Sent
              </Badge>
            ) : (
              <Button
                size="sm"
                disabled={applying === d.id || !isEligible}
                onClick={() => apply(d.id)}
                className={cn(
                  "h-9 px-6 text-xs font-bold shadow-glow transition-all",
                  isEligible ? "bg-gradient-primary text-primary-foreground hover:opacity-90" : "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed"
                )}
              >
                {applying === d.id ? "Processing..." : isEligible ? "Apply Now" : "Ineligible"}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout
      role="student"
      title="Placement Drives"
      subtitle="Browse active company drives. Eligibility is strictly enforced based on your CGPA and AI Readiness score."
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          <Tabs defaultValue="active">
            <div className="flex items-center justify-between mb-5">
              <TabsList className="bg-secondary/30 p-1 rounded-xl">
                <TabsTrigger value="active" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Active
                  {active.length > 0 && <span className="ml-2 bg-primary/20 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-bold">{active.length}</span>}
                </TabsTrigger>
                <TabsTrigger value="closed" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Completed
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="active">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="glass-card rounded-2xl h-64 animate-pulse bg-secondary/20" />)}
                </div>
              ) : active.length === 0 ? (
                <div className="glass-card rounded-2xl p-20 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-display font-semibold">No active drives</h3>
                  <p className="text-sm text-muted-foreground mt-2">Drives will appear here when scheduled by the placement office.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {active.map(d => <DriveCard key={d.id} d={d} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="closed">
              {closed.length === 0 ? (
                <div className="glass-card rounded-2xl p-20 text-center text-muted-foreground">
                    <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p>No completed drives found in the recent history.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {closed.map(d => <DriveCard key={d.id} d={d} />)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar: Student eligibility preview */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 rounded-2xl border border-primary/20 bg-primary/5">
            <h3 className="font-display font-bold mb-4 flex items-center gap-2 text-primary">
               <GraduationCap className="h-5 w-5" /> Your Eligibility
            </h3>
            {student ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-background/50 p-4 border border-border/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Current CGPA</span>
                    <span className="text-sm font-bold">{student.StudentProfile?.cgpa || "—"}</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(student.StudentProfile?.cgpa / 10) * 100}%` }} />
                  </div>
                </div>

                <div className="rounded-xl bg-background/50 p-4 border border-border/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Readiness Score</span>
                    <span className="text-sm font-bold text-primary">{student.StudentProfile?.readinessScore || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${student.StudentProfile?.readinessScore || 0}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-secondary/30 flex items-start gap-3">
                  <Zap className="h-4 w-4 text-warning mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Higher readiness scores unlock premium opportunities. Keep practicing in the <strong className="text-foreground">Training Center</strong> to boost your score.
                  </p>
                </div>
              </div>
            ) : (
                <p className="text-xs text-muted-foreground italic">Syncing profile...</p>
            )}
          </motion.div>

          <div className="glass-card p-6 rounded-2xl">
             <h3 className="font-display font-bold mb-4">How it works</h3>
             <ul className="space-y-3">
               {[
                 "Companies set minimum cutoffs.",
                 "Eligibility is auto-validated.",
                 "Applied status is real-time.",
                 "Status updates via notifications."
               ].map((text, i) => (
                 <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{text}</span>
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDrives;
