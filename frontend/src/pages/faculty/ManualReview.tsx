import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Eye, CheckCircle2, XCircle, Trophy, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { AssessmentAPI } from "@/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Assessment { id: string; title: string; type: string; createdAt: string; _count?: { attempts: number } }

const ManualReview = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [openAttempt, setOpenAttempt] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    AssessmentAPI.list().then((data: any) => {
      const list = Array.isArray(data) ? data : data?.data || [];
      setAssessments(list);
      if (list[0]) setSelectedId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingAttempts(true);
    AssessmentAPI.assessmentAttempts(selectedId).then(data => {
      setAttempts(Array.isArray(data) ? data : []);
      setLoadingAttempts(false);
    });
  }, [selectedId]);

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
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]">{selectedAssessment.type}</Badge>
            <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">{attempts.length} submissions</Badge>
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
          const isOpen = openAttempt === a.id;
          const questions = a.assessment?.questions || [];
          const displayName = a.user?.name || a.user?.email?.split("@")[0] || "Unknown";

          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              {/* Row Header */}
              <button
                onClick={() => setOpenAttempt(isOpen ? null : a.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {displayName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{a.user?.usn || a.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {Math.round(a.timeTaken / 60)}m {a.timeTaken % 60}s
                  </div>
                  <div className={cn(
                    "font-display font-bold text-lg min-w-[50px] text-right",
                    a.score >= 80 ? "text-success" : a.score >= 60 ? "text-warning" : "text-destructive"
                  )}>
                    {a.score?.toFixed(1)}%
                  </div>
                  <Badge className={cn("text-[10px]", a.score >= 80 ? "bg-success/15 text-success border-success/30" : a.score >= 60 ? "bg-warning/15 text-warning border-warning/30" : "bg-destructive/15 text-destructive border-destructive/30")}>
                    {a.correctCount}/{a.totalCount} correct
                  </Badge>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded Answer View */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border/50 overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      {questions.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Question details unavailable.</p>
                      ) : questions.map((q: any, qi: number) => {
                        const studentAns = a.answers?.[q.id];
                        const options = Array.isArray(q.options) ? q.options : [];
                        const studentText = options[studentAns] ?? studentAns ?? "—";
                        const isCorrect = q.type === "MCQ"
                          ? options[studentAns] === q.answer
                          : null; // Descriptive: no auto-grade

                        return (
                          <div key={q.id} className="rounded-lg border border-border/60 bg-muted/20 p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <p className="text-sm font-medium text-foreground leading-relaxed">
                                <span className="text-muted-foreground font-normal mr-2">Q{qi + 1}.</span>
                                {q.text}
                              </p>
                              {isCorrect !== null && (
                                isCorrect
                                  ? <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                  : <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                              )}
                            </div>

                            {/* MCQ Options */}
                            {q.type === "MCQ" && options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                                {options.map((opt: string, oi: number) => (
                                  <div
                                    key={oi}
                                    className={cn(
                                      "text-xs px-3 py-2 rounded border transition-colors",
                                      opt === q.answer
                                        ? "border-success/40 bg-success/10 text-success"
                                        : oi === studentAns && opt !== q.answer
                                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                                        : "border-border/50 bg-secondary/30 text-muted-foreground"
                                    )}
                                  >
                                    {opt === q.answer && "✓ "}{oi === studentAns && opt !== q.answer && "✗ "}{opt}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-[11px]">
                              <span className="text-muted-foreground">Student answered: <span className="text-foreground font-medium">{studentText}</span></span>
                              <span className="text-muted-foreground">Correct: <span className="text-success font-medium">{q.answer}</span></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default ManualReview;
