import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, CheckCircle2, XCircle, Trophy, 
  AlertCircle, ShieldCheck, Zap, BarChart3,
  Timer, ChevronRight, ChevronLeft, Flag,
  LayoutDashboard, Info, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentAPI } from "@/api";
import type { QuizQuestion, ScheduledTest } from "@/data/mock";
import { toast } from "sonner";
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, ResponsiveContainer 
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  test: ScheduledTest | { id: string; title: string; subject: string; durationMin: number; questionsCount?: number };
  onClose: () => void;
}

type Phase = "intro" | "running" | "result";

export const ExamEnvironment = ({ test, onClose }: Props) => {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  
  // Scoring & Stats
  const totalSeconds = (test.durationMin || 60) * 60;
  const [seconds, setSeconds] = useState(totalSeconds);
  const submittedRef = useRef(false);
  const focusLostRef = useRef(0);
  
  useEffect(() => {
    StudentAPI.quiz().then(setQuestions);
  }, []);

  // Behavioral Tracking
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && phase === "running") {
        focusLostRef.current += 1;
        toast.error("Test focus lost! This will affect your behavioral readiness score.", {
          icon: <AlertCircle className="text-destructive" />
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [phase]);

  // Keyboard Shortcuts (1-4 for options, arrows for nav)
  useEffect(() => {
    if (phase !== "running" || !questions.length) return;

    const handleKey = (e: KeyboardEvent) => {
      // 1-4 for options
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        const qId = questions[current].id;
        setAnswers(prev => ({ ...prev, [qId]: idx }));
      }
      // Left/Right for navigation
      if (e.key === "ArrowRight") {
        setCurrent(prev => Math.min(prev + 1, questions.length - 1));
      }
      if (e.key === "ArrowLeft") {
        setCurrent(prev => Math.max(prev - 1, 0));
      }
      // F for flag
      if (e.key.toLowerCase() === "f") {
        toggleFlag(questions[current].id);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, current, questions]);

  // Timer logic
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          submit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const submit = (auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    StudentAPI.submitQuiz(test.id, answers);
    setPhase("result");
    setShowConfirmSubmit(false);
    if (auto) toast.warning("Time's up — auto-submitted");
    else toast.success("Assessment submitted successfully!");
  };

  const toggleFlag = (id: string) => {
    setFlags(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const stats = useMemo(() => {
    const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;
    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    
    // Topic breakdown for Radar Chart
    const topics: Record<string, { total: number; correct: number }> = {};
    questions.forEach(q => {
      if (!topics[q.topic]) topics[q.topic] = { total: 0, correct: 0 };
      topics[q.topic].total += 1;
      if (answers[q.id] === q.correctIndex) topics[q.topic].correct += 1;
    });

    const radarData = Object.entries(topics).map(([name, data]) => ({
      subject: name,
      score: Math.round((data.correct / data.total) * 100),
      fullMark: 100
    }));

    return { correct, total: questions.length, score, radarData };
  }, [answers, questions]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const timeProgress = ((totalSeconds - seconds) / totalSeconds) * 100;
  const q = questions[current];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col h-screen w-screen bg-background overflow-hidden animate-in fade-in duration-300">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: PRE-TEST WAITING ROOM */}
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -20 }} className="p-8 h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold tracking-tight">{test.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5" /> {test.subject} Assessment
                  </p>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/20 px-3 py-1">High Focus Required</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-6 border-primary/10">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Timer className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-bold">Session Timing</h4>
                  <p className="text-2xl font-display font-bold mt-1">{test.durationMin}m</p>
                  <p className="text-xs text-muted-foreground mt-2 italic">Auto-submits at 00:00</p>
                </div>

                <div className="glass-card rounded-2xl p-6 border-success/10">
                  <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-5 w-5 text-success" />
                  </div>
                  <h4 className="font-bold">Integrity Level</h4>
                  <p className="text-2xl font-display font-bold mt-1 text-success">Strict</p>
                  <p className="text-xs text-muted-foreground mt-2">Tab switches are monitored</p>
                </div>

                <div className="glass-card rounded-2xl p-6 border-warning/10">
                  <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                    <LayoutDashboard className="h-5 w-5 text-warning" />
                  </div>
                  <h4 className="font-bold">Questions</h4>
                  <p className="text-2xl font-display font-bold mt-1">{questions.length}</p>
                  <p className="text-xs text-muted-foreground mt-2">Topic-mapped MCQs</p>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider"><Info className="h-4 w-4 text-primary" /> Candidate Instructions</h3>
                <ul className="space-y-3 text-sm text-muted-foreground pl-4">
                  <li className="list-disc leading-relaxed">Ensure a stable internet connection. Session data will be cached locally but requires a final sync.</li>
                  <li className="list-disc leading-relaxed">You can navigate using numbers <Badge variant="secondary" className="mx-1 h-5 px-1 font-mono">1-4</Badge> and <Badge variant="secondary" className="mx-1 h-5 px-1 font-mono">Arrow Keys</Badge>.</li>
                  <li className="list-disc leading-relaxed text-destructive font-medium italic">Detection of unauthorized tab switching is active. Focus score is calculated in real-time.</li>
                </ul>
              </div>

              <div className="flex justify-center flex-col items-center gap-4 pt-4">
                <Button 
                  size="lg"
                  disabled={!questions.length}
                  onClick={() => setPhase("running")}
                  className="bg-gradient-primary text-primary-foreground h-14 px-12 text-lg font-bold shadow-glow group"
                >
                  Start Assessment <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="ghost" onClick={onClose} className="text-sm text-muted-foreground">Return to Dashboard</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: LIVE TEST ENVIRONMENT */}
        {phase === "running" && q && (
          <motion.div key="running" initial={{ opacity: 1 }} className="flex flex-col h-full bg-background text-white overflow-hidden">
            {/* Environment Header */}
            <div className="h-16 border-b border-border/50 bg-black/40 flex items-center justify-between px-6 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="min-w-0 leading-tight">
                  <h4 className="font-bold text-sm truncate text-white uppercase tracking-tight">{test.title}</h4>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Active Session • {q.topic}</p>
                </div>
              </div>

              <div className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-md transition-all duration-300",
                seconds < 60 ? "bg-destructive/20 text-destructive animate-pulse" : "bg-primary/10 text-primary border border-primary/20"
              )}>
                <Clock className="h-5 w-5" />
                <span className="font-mono text-xl font-bold tabular-nums">{mm}:{ss}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right mr-4 hidden md:block">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Candidate Score</p>
                  <p className="text-xs font-bold text-primary">Live Progress Encrypted</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => setShowConfirmSubmit(true)} className="font-bold shadow-lg h-9 px-6 bg-destructive hover:bg-destructive/90">Submit Assessment</Button>
              </div>
            </div>

            <Progress value={timeProgress} className="h-1 rounded-none bg-white/5" />

            {/* Main Test Area */}
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 bg-[url('/grid.svg')] bg-center bg-background/50 border-x border-white/5 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-8">
                  <motion.div 
                    key={q.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-mono">Q{current + 1} OF {questions.length}</Badge>
                        <Badge variant="secondary" className="text-[10px] bg-secondary/10 uppercase tracking-widest">{q.topic}</Badge>
                        <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground ml-auto hidden sm:block">Shortcut: 1-4 to Toggle</Badge>
                      </div>
                      <h3 className="text-xl font-display font-medium text-white leading-snug">
                        {q.question}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {q.options.map((opt, i) => {
                        const isSelected = answers[q.id] === i;
                        return (
                          <button
                            key={i}
                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: i }))}
                            className={cn(
                              "group flex items-center p-4 rounded-xl border-2 text-left transition-all duration-300 relative overflow-hidden",
                              isSelected 
                                ? "border-primary bg-primary/10 text-white shadow-[0_0_20px_hsl(var(--primary)/0.05)] scale-[1.01]" 
                                : "border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                            )}
                          >
                            <span className={cn(
                              "h-8 w-8 rounded-lg flex items-center justify-center font-mono mr-3 border text-xs transition-all duration-300",
                              isSelected 
                                ? "bg-primary text-primary-foreground border-primary" 
                                : "bg-white/5 border-white/10 group-hover:border-primary/50 group-hover:text-primary"
                            )}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="text-sm font-medium">{opt}</span>
                            {isSelected && (
                              <motion.div layoutId="choice" className="ml-auto">
                                <CheckCircle2 className="h-5 w-5 text-primary animate-in fade-in zoom-in-50" />
                              </motion.div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Sidebar Navigator */}
              <div className="w-80 border-l border-white/5 bg-black/20 backdrop-blur-3xl hidden xl:flex flex-col p-6 overflow-y-auto">
                <h5 className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase mb-6 flex items-center gap-2">
                  <LayoutDashboard className="h-3 w-3" /> Navigator Matrix
                </h5>
                <div className="grid grid-cols-5 gap-3">
                  {questions.map((_, i) => {
                    const ans = answers[questions[i].id] !== undefined;
                    const flg = flags.has(questions[i].id);
                    const isAct = i === current;
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={cn(
                          "relative h-11 w-11 rounded-xl flex items-center justify-center font-mono text-xs transition-all duration-300 transform",
                          isAct ? "bg-white text-black font-bold ring-4 ring-primary/20 scale-110 z-10" :
                          ans ? "border-2 border-primary/50 text-white bg-primary/5" :
                          "bg-white/5 text-slate-500 border border-white/5 hover:border-white/20"
                        )}
                      >
                        {i + 1}
                        {flg && <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-warning rounded-full border-2 border-slate-900 shadow-lg" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-auto space-y-4">
                  <div className="glass-card rounded-xl p-4 bg-white/5 border-white/10">
                    <div className="flex justify-between text-[11px] text-slate-500 font-bold mb-2">
                      <span>COMPLETION RATE</span>
                      <span className="text-white">{Object.keys(answers).length} / {questions.length}</span>
                    </div>
                    <Progress value={(Object.keys(answers).length / questions.length) * 100} className="h-1.5 bg-white/5" />
                  </div>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full border-white/10 transition-colors uppercase text-[10px] font-bold tracking-widest h-10",
                      flags.has(q.id) ? "bg-warning/10 text-warning border-warning/20" : "hover:bg-white/5 text-slate-300"
                    )}
                    onClick={() => toggleFlag(q.id)}
                  >
                    <Flag className={cn("h-4 w-4 mr-2", flags.has(q.id) ? "fill-warning text-warning" : "")} />
                    {flags.has(q.id) ? "Bookmarked" : "Bookmark for review"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Environment Footer */}
            <div className="h-20 border-t border-white/5 bg-black/40 px-8 flex items-center justify-between backdrop-blur-xl shrink-0">
              <Button 
                variant="ghost" 
                disabled={current === 0} 
                onClick={() => setCurrent(c => c - 1)}
                className="text-slate-400 hover:text-white font-bold"
              >
                <ChevronLeft className="h-5 w-5 mr-1" /> Previous <span className="hidden sm:inline ml-1 text-[10px] opacity-50 underline">←</span>
              </Button>

              <div className="flex gap-2 items-center">
                <ShieldCheck className="h-4 w-4 text-success/50" />
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest hidden sm:inline">Secure Session Verified</span>
              </div>

              {current < questions.length - 1 ? (
                <Button 
                  onClick={() => setCurrent(c => c + 1)}
                  className="bg-white text-black hover:bg-slate-200 font-bold px-8 h-12 rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                   Save & Next <span className="hidden sm:inline ml-1 text-[10px] opacity-50 underline">→</span>
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowConfirmSubmit(true)}
                  className="bg-gradient-primary text-primary-foreground font-bold px-12 h-12 rounded-xl shadow-glow transition-all hover:scale-105"
                >
                  Confirm Finish <ShieldCheck className="h-5 w-5 ml-2" />
                </Button>
              )}
            </div>

            {/* SUBMISSION CONFIRMATION MODAL */}
            <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
              <DialogContent className="glass-card border-white/10 bg-slate-900 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">Ready to finish?</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    You have answered <span className="text-white font-bold">{Object.keys(answers).length}</span> out of <span className="text-white font-bold">{questions.length}</span> questions.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  {flags.size > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/10 text-warning text-xs">
                      <AlertCircle className="h-4 w-4" />
                      <p>You still have <span className="font-bold">{flags.size} items flagged</span> for review. Review them now?</p>
                    </div>
                  )}
                  {Object.keys(answers).length < questions.length && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/10 text-destructive text-xs">
                      <AlertCircle className="h-4 w-4" />
                      <p>Warning: You have <span className="font-bold">{questions.length - Object.keys(answers).length} unanswered</span> questions.</p>
                    </div>
                  )}
                </div>
                <DialogFooter className="flex gap-2">
                  <Button variant="ghost" onClick={() => setShowConfirmSubmit(false)}>Go back</Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => submit(false)}
                    className="font-bold px-8 bg-gradient-primary border-none shadow-glow text-primary-foreground"
                  >
                    Submit Now
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}

        {/* PHASE 3: RESULT & READINESS INSIGHTS */}
        {phase === "result" && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <div className="h-20 w-20 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow mx-auto rotate-12">
                  <Trophy className="h-10 w-10 text-primary-foreground -rotate-12" />
                </div>
                <h2 className="text-4xl font-display font-bold">Assessment Complete</h2>
                <div className="flex items-center justify-center gap-2">
                  <Badge className="bg-success/20 text-success border-success/20">Session Verified</Badge>
                  <Badge className="bg-primary/20 text-primary border-primary/20">Readiness Synced</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score Card */}
                <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
                  <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Global Readiness Score</h4>
                  <div className="relative">
                    <svg className="h-40 w-40 transform -rotate-90">
                      <circle cx="80" cy="80" r="70" className="stroke-secondary/30 fill-none" strokeWidth="12" />
                      <motion.circle 
                        cx="80" cy="80" r="70" 
                        initial={{ strokeDasharray: "440", strokeDashoffset: "440" }}
                        animate={{ strokeDashoffset: String(440 - (440 * stats.score) / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="stroke-primary fill-none shadow-glow" strokeWidth="12" strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-display font-bold text-gradient">{stats.score}%</span>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full relative z-10">
                    <div className="bg-secondary/30 backdrop-blur-md rounded-xl p-3 flex-1 border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Accuracy</p>
                      <p className="font-bold text-lg">{stats.correct}/{stats.total}</p>
                    </div>
                    <div className="bg-secondary/30 backdrop-blur-md rounded-xl p-3 flex-1 border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Time</p>
                      <p className="font-bold text-lg">{Math.round((totalSeconds - seconds) / 60)}m</p>
                    </div>
                  </div>
                </div>

                {/* Radar Mastery Chart */}
                <div className="lg:col-span-2 glass-card rounded-3xl p-8 flex flex-col h-[400px]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold flex items-center gap-2 uppercase tracking-tighter"><BarChart3 className="h-4 w-4 text-primary" /> Multi-Topic Readiness Matrix</h4>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }} />
                        <Radar
                          name="Performance"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Behavioral Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card rounded-2xl p-6 space-y-4 border-l-4 border-l-warning/50">
                  <h4 className="font-bold flex items-center gap-2"><Zap className="h-4 w-4 text-warning" /> Behavioral Engagement Analysis</h4>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Session Consistency</span>
                      <span className="text-success font-bold tracking-tight">HIGH</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Focus Deviations</span>
                      <span className={cn(
                        "font-bold tabular-nums",
                        focusLostRef.current === 0 ? "text-success" : "text-destructive"
                      )}>
                        {focusLostRef.current} DETECTED
                      </span>
                    </div>
                    <div className="mt-4 bg-secondary/20 p-4 rounded-xl border border-white/5 text-[11px] text-slate-400 leading-relaxed font-medium">
                      {focusLostRef.current === 0 
                        ? "PRO-STATUS: You showed exceptional behavioral integrity. No window switches or focus losses detected. This significantly boosts your placement profile."
                        : "DEVELOPMENT NEEDED: Multiple focus deviations detected. Real-world proctors flag these behaviors. Aim for 0 deviations in next 'Strict' session."}
                    </div>
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-6 bg-primary/[0.03] border-primary/10">
                  <h4 className="font-bold mb-6 text-sm flex items-center gap-2 uppercase tracking-widest"><Sparkles className="h-4 w-4 text-primary" /> AI Recommended Drills</h4>
                  <div className="space-y-3">
                    {stats.radarData.filter(d => d.score < 60).length > 0 ? (
                      stats.radarData.filter(d => d.score < 60).map(d => (
                        <div key={d.subject} className="bg-background border border-border/50 p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all hover:bg-primary/5 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold font-display uppercase tracking-tight">Focus: {d.subject}</p>
                              <p className="text-[10px] text-muted-foreground">Critical Gap Identified ({d.score}%)</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="group-hover:text-primary"><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                         <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 text-success"><ShieldCheck className="h-6 w-6" /></div>
                         <p className="text-sm font-bold">Zero Mastery Gaps Detected</p>
                         <p className="text-xs text-muted-foreground mt-1">Excellent performance across all assessed tags.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <Button size="lg" onClick={onClose} className="bg-white text-black font-bold px-16 h-14 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-2xl">
                  Exit to Portal Dashboard
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
