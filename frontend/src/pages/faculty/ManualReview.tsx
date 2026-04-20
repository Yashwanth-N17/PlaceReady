import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, Eye, CheckCircle2, XCircle, Trophy, ChevronDown, ChevronUp, Clock, ListChecks, ArrowUpRight } from "lucide-react";
import { AssessmentAPI } from "@/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Assessment { id: string; title: string; type: string; resultsReleased: boolean; createdAt: string; _count?: { attempts: number } }

const ManualReview = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Modal State
  const [inspectingAttempt, setInspectingAttempt] = useState<any | null>(null);
  const [editScore, setEditScore] = useState(0);
  const [editCorrect, setEditCorrect] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAssessments = () => {
    AssessmentAPI.list().then((data: any) => {
      const list = Array.isArray(data) ? data : data?.data || [];
      setAssessments(list);
      if (list[0] && !selectedId) setSelectedId(list[0].id);
    });
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handlePublish = async () => {
    if (!selectedId) return;
    if (!confirm("Are you sure you want to publish results? This will notify all students and make their scores visible.")) return;

    try {
      const res = await AssessmentAPI.publish(selectedId);
      if (res.success) {
        toast.success("Results published successfully!");
        fetchAssessments(); // Refresh list to update status
      }
    } catch (err: any) {
      toast.error("Failed to publish results");
    }
  };

  useEffect(() => {
    if (!selectedId) return;
    setLoadingAttempts(true);
    AssessmentAPI.assessmentAttempts(selectedId).then(data => {
      setAttempts(Array.isArray(data) ? data : []);
      setLoadingAttempts(false);

      // Auto-open if query param exists
      const targetId = searchParams.get("attemptId");
      if (targetId && Array.isArray(data)) {
        const found = data.find(at => at.id === targetId);
        if (found) {
          setInspectingAttempt(found);
          setEditScore(found.score || 0);
          setEditCorrect(found.correctCount || 0);
        }
      }
    });
  }, [selectedId, searchParams]);

  const handleSaveGrade = async () => {
    if (!inspectingAttempt) return;
    setIsSaving(true);
    try {
      const res = await AssessmentAPI.grade(inspectingAttempt.id, { score: editScore, correctCount: editCorrect });
      if (res.success) {
        toast.success("Grade updated successfully!");
        setInspectingAttempt(null);
        // Refresh attempts list
        AssessmentAPI.assessmentAttempts(selectedId).then(data => {
          setAttempts(Array.isArray(data) ? data : []);
        });
      }
    } catch (err: any) {
      toast.error("Failed to update grade");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = attempts.filter(a =>
    (a.user?.name || a.user?.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedAssessment = assessments.find(a => a.id === selectedId);

  return (
    <DashboardLayout
      role="faculty"
      title="Manual Review"
      subtitle="Inspect individual student submissions and verify automated scores."
    >
      {/* Assessment Selector */}
      <div className="glass-card rounded-xl p-4 mb-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <p className="text-xs text-muted-foreground mb-1.5">Select Assessment</p>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="h-9 bg-secondary/40 border-border/60 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {assessments.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.title} — {a.type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedAssessment && (
          <div className="flex gap-3 items-center flex-wrap">
            <Badge variant="outline" className="text-[10px]">{selectedAssessment.type}</Badge>
            <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">{attempts.length} submissions</Badge>
            
            {selectedAssessment.resultsReleased ? (
              <Badge className="bg-success text-success-foreground border-0 text-[10px] flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Results Published
              </Badge>
            ) : (
              <Button 
                size="sm" 
                onClick={handlePublish}
                className="h-8 bg-gradient-primary text-primary-foreground text-[11px] font-bold shadow-glow"
              >
                Process & Publish Results
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search student..."
          className="pl-9 h-9 bg-muted/40 border-border/60 text-sm"
        />
      </div>

      {/* Attempts List */}
      <div className="space-y-3">
        {loadingAttempts ? (
          <div className="glass-card rounded-xl p-12 text-center text-muted-foreground animate-pulse">Loading submissions...</div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">No submissions yet for this assessment.</div>
        ) : filtered.map((a, i) => {
          const displayName = a.user?.name || a.user?.email?.split("@")[0] || "Unknown";

          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-xl overflow-hidden border border-border/40 hover:border-primary/20 transition-all mb-3"
            >
              <div className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {displayName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{a.user?.roll || a.user?.usn || a.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
                    <Clock className="h-3.5 w-3.5" />
                    {Math.round(a.timeTaken / 60)}m {a.timeTaken % 60}s
                  </div>
                  <div className={cn(
                    "font-display font-bold text-lg min-w-[50px] text-right mr-4",
                    a.score >= 80 ? "text-success" : a.score >= 60 ? "text-warning" : "text-destructive"
                  )}>
                    {a.score?.toFixed(1)}%
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setInspectingAttempt(a);
                      setEditScore(a.score || 0);
                      setEditCorrect(a.correctCount || 0);
                    }}
                    className="h-8 border-primary/30 text-primary hover:bg-primary/5 text-xs font-bold"
                  >
                    Inspect & Grade <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Inspect Attempt Modal ── */}
      <Dialog open={!!inspectingAttempt} onOpenChange={(open) => !open && setInspectingAttempt(null)}>
        <DialogContent className="glass-card border-white/10 bg-slate-950 sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl backdrop-blur-2xl z-[200]">
          {inspectingAttempt && (
            <>
              <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-display font-bold">Review Submission</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {inspectingAttempt.user?.name} · {inspectingAttempt.user?.roll || inspectingAttempt.user?.usn}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-bold px-3 py-1">
                    {inspectingAttempt.score?.toFixed(1)}% Overall
                  </Badge>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Meta details */}
                <div className="grid grid-cols-3 gap-4 pb-6 border-b border-white/5">
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Time Taken</p>
                     <p className="text-sm font-medium flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {Math.round(inspectingAttempt.timeTaken / 60)}m {inspectingAttempt.timeTaken % 60}s</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Tab switches</p>
                     <p className={cn("text-sm font-medium", inspectingAttempt.focusLossCount > 2 ? "text-destructive" : "text-foreground")}>
                       {inspectingAttempt.focusLossCount} events
                     </p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Raw Marks</p>
                     <p className="text-sm font-medium">{inspectingAttempt.correctCount} / {inspectingAttempt.totalCount}</p>
                   </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  {inspectingAttempt.assessment?.questions?.map((q: any, qi: number) => {
                    const studentAns = inspectingAttempt.answers?.[q.id];
                    const options = Array.isArray(q.options) ? q.options : [];
                    const studentText = options[studentAns] ?? studentAns ?? "—";
                    const isCorrect = q.type === "MCQ" ? String(options[studentAns]) === String(q.answer) : null;

                    return (
                      <div key={q.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-3 group">
                        <div className="flex items-start justify-between gap-4">
                          <span className="h-6 w-6 rounded bg-secondary flex items-center justify-center text-[10px] font-bold shrink-0">
                            {qi + 1}
                          </span>
                          <p className="text-sm text-foreground/90 flex-1 leading-relaxed">{q.text}</p>
                          {q.type === "MCQ" && (
                            isCorrect ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>

                        <div className="pl-10 space-y-2">
                          <div className="p-2.5 rounded-lg bg-background/50 border border-border/40">
                             <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Student Answer</p>
                             <div className="flex items-center justify-between">
                               <p className={cn("text-sm", isCorrect === false ? "text-destructive font-medium" : "text-foreground")}>
                                 {studentText}
                               </p>
                             </div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-success/5 border border-success/10 transition-opacity opacity-60 group-hover:opacity-100">
                             <p className="text-[10px] text-success/60 uppercase font-bold mb-1">Reference Answer</p>
                             <p className="text-sm text-success/90 font-medium">{q.answer}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="p-6 border-t border-white/5 bg-slate-900/50 flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Correct Count</p>
                    <div className="flex items-center gap-2">
                       <input 
                         type="number" 
                         className="w-16 h-9 bg-secondary/50 border border-border/60 rounded px-2 text-sm font-bold text-center"
                         value={editCorrect}
                         onChange={e => setEditCorrect(Number(e.target.value))}
                         disabled={selectedAssessment.resultsReleased || isSaving}
                       />
                       <span className="text-xs text-muted-foreground">/ {inspectingAttempt.totalCount}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Final Score %</p>
                    <input 
                      type="number" 
                      className="w-20 h-9 bg-secondary/50 border border-border/60 rounded px-2 text-sm font-bold text-center text-primary"
                      value={editScore}
                      onChange={e => setEditScore(Number(e.target.value))}
                      disabled={selectedAssessment.resultsReleased || isSaving}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <Button variant="ghost" onClick={() => setInspectingAttempt(null)} className="h-10 text-muted-foreground">Cancel</Button>
                   <Button 
                    onClick={handleSaveGrade}
                    disabled={selectedAssessment.resultsReleased || isSaving}
                    className="h-10 bg-primary text-primary-foreground min-w-[120px] font-bold shadow-glow"
                   >
                     {isSaving ? "Saving..." : "Save Marks"}
                   </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManualReview;
