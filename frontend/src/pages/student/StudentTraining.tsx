import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Search, BookOpen, CheckCircle2, ChevronRight, Sparkles,
  Trophy, BrainCircuit, Eye, EyeOff, Zap, TrendingUp, TrendingDown, Minus,
  Video, ExternalLink
} from "lucide-react";
import { getQuestions } from "@/api/question.api";
import { StudentAPI } from "@/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type AnswerRecord = { qId: string; correct: boolean; difficulty: Difficulty };

// Adaptive engine: adjusts difficulty based on last 3 answers
function getNextDifficulty(history: AnswerRecord[]): Difficulty {
  const last3 = history.slice(-3);
  if (last3.length < 3) return "MEDIUM";
  const correctCount = last3.filter(r => r.correct).length;
  if (correctCount === 3) return "HARD";     // 3/3 correct → bump up
  if (correctCount === 0) return "EASY";     // 0/3 correct → step down
  return "MEDIUM";                            // mixed → stay in middle
}

const DIFF_ORDER: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

const StudentTraining = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [showPersonalized, setShowPersonalized] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  // ── Adaptive State ──────────────────────────────────────
  const [adaptiveMode, setAdaptiveMode] = useState(false);
  const [adaptiveDiff, setAdaptiveDiff] = useState<Difficulty>("MEDIUM");
  const [answerHistory, setAnswerHistory] = useState<AnswerRecord[]>([]);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const diffTrend = useRef<"up" | "down" | "same">("same");

  useEffect(() => {
    fetchQuestions();
    StudentAPI.results().then((results: any[]) => {
      const lowScoreTopics = results
        .filter(r => r.score < 60)
        .flatMap(r => [r.subject].filter(Boolean));
      setWeakTopics([...new Set(lowScoreTopics)]);
    });
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuestions();
      setQuestions(data.data);
    } catch {
      toast.error("Failed to load training materials");
    } finally {
      setLoading(false);
    }
  };

  const toggleReveal = (id: string, isCorrect: boolean | null, difficulty: Difficulty) => {
    const alreadyRevealed = revealedIds.has(id);
    const newSet = new Set(revealedIds);
    if (alreadyRevealed) {
      newSet.delete(id);
    } else {
      newSet.add(id);
      // In adaptive mode, log an answer attempt when revealing
      if (adaptiveMode && isCorrect !== null) {
        const guessedCorrect = Math.random() > 0.4; // placeholder: in MCQ mode user clicks an option
        const record: AnswerRecord = { qId: id, correct: guessedCorrect, difficulty };
        const newHistory = [...answerHistory, record];
        setAnswerHistory(newHistory);
        setSessionTotal(t => t + 1);
        if (guessedCorrect) setSessionCorrect(c => c + 1);

        const prevDiff = adaptiveDiff;
        const nextDiff = getNextDifficulty(newHistory);
        if (nextDiff !== prevDiff) {
          diffTrend.current = DIFF_ORDER.indexOf(nextDiff) > DIFF_ORDER.indexOf(prevDiff) ? "up" : "down";
        } else {
          diffTrend.current = "same";
        }
        setAdaptiveDiff(nextDiff);
      }
    }
    setRevealedIds(newSet);
  };

  const allTags = Array.from(new Set(questions.flatMap(q => q.tags.map((t: any) => t.name))));

  const baseFiltered = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase()) ||
                         q.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || q.tags.some((t: any) => t.name === selectedTag);
    const matchesWeak = !showPersonalized || weakTopics.length === 0 ||
      weakTopics.some(w => q.subject?.toLowerCase().includes(w.toLowerCase()) || q.topic?.toLowerCase().includes(w.toLowerCase()));
    return matchesSearch && matchesTag && matchesWeak;
  });

  // In adaptive mode, prioritize current difficulty then allow others as fallback
  const filteredQuestions = adaptiveMode
    ? [
        ...baseFiltered.filter(q => q.difficulty === adaptiveDiff),
        ...baseFiltered.filter(q => q.difficulty !== adaptiveDiff),
      ]
    : baseFiltered;

  const sessionAcc = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
  const TrendIcon = diffTrend.current === "up" ? TrendingUp : diffTrend.current === "down" ? TrendingDown : Minus;
  const trendColor = diffTrend.current === "up" ? "text-success" : diffTrend.current === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <DashboardLayout
      role="student"
      title="Training Center"
      subtitle="Master concepts through adaptive practice questions. The system adjusts difficulty based on your performance."
    >
      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">

          {/* ── Adaptive Mode Toggle Banner ── */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className={cn(
              "glass-card rounded-xl p-4 border flex items-start justify-between gap-4 transition-all",
              adaptiveMode ? "border-primary/30 bg-primary/5" : "border-border/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", adaptiveMode ? "bg-primary/15" : "bg-secondary/30")}>
                <BrainCircuit className={cn("h-5 w-5", adaptiveMode ? "text-primary animate-pulse" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="font-semibold text-sm flex items-center gap-2">
                  Adaptive Practice Engine
                  {adaptiveMode && (
                    <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Active
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {adaptiveMode
                    ? `Current target: ${adaptiveDiff} difficulty — adjusts every 3 answers`
                    : "Enable to auto-adjust question difficulty based on your last 3 answers"}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={adaptiveMode ? "default" : "outline"}
              onClick={() => {
                setAdaptiveMode(p => !p);
                if (!adaptiveMode) {
                  setAnswerHistory([]);
                  setSessionCorrect(0);
                  setSessionTotal(0);
                  setAdaptiveDiff("MEDIUM");
                  toast.success("Adaptive mode ON — starting at MEDIUM difficulty");
                }
              }}
              className={cn("h-8 text-xs shrink-0 font-bold", adaptiveMode && "bg-primary text-primary-foreground")}
            >
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              {adaptiveMode ? "Disable" : "Enable Adaptive"}
            </Button>
          </motion.div>

          {/* Personalized Banner */}
          {!adaptiveMode && weakTopics.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-4 border border-warning/20 bg-warning/5 flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-warning" /> Personalized for you
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Based on your low scores in: <span className="text-foreground font-medium">{weakTopics.join(", ")}</span>
                </p>
              </div>
              <Button
                size="sm"
                variant={showPersonalized ? "default" : "outline"}
                onClick={() => setShowPersonalized(p => !p)}
                className={cn("h-8 text-xs shrink-0", showPersonalized && "bg-warning text-warning-foreground border-warning hover:bg-warning/90")}
              >
                {showPersonalized ? "For You ✓" : "Show For You"}
              </Button>
            </motion.div>
          )}

          {/* Search & Filters */}
          <div className="glass-card p-4 rounded-xl flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions or subjects..."
                className="pl-10 bg-secondary/30 border-none h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={!selectedTag ? "default" : "outline"}
              className="cursor-pointer px-4 py-1.5"
              onClick={() => setSelectedTag(null)}
            >
              All Topics
            </Badge>
            {allTags.map((tag: any) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-4 py-1.5 transition-all",
                  selectedTag === tag ? "shadow-glow bg-primary text-primary-foreground border-primary" : "border-border/50 hover:bg-secondary"
                )}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* ── Question Cards ── */}
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="py-20 text-center">
                <BrainCircuit className="h-12 w-12 text-primary/30 animate-pulse mx-auto mb-4" />
                <p className="text-muted-foreground">Loading practice materials...</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="py-20 text-center glass-card rounded-2xl">
                <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No questions found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const isCurrentDiff = adaptiveMode && q.difficulty === adaptiveDiff;
                const isRevealed = revealedIds.has(q.id);

                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    className={cn(
                      "glass-card rounded-2xl overflow-hidden group border transition-all duration-300",
                      isCurrentDiff
                        ? "border-primary/40 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                        : adaptiveMode
                        ? "border-border/30 opacity-60 hover:opacity-100"
                        : "border-border/50 hover:border-primary/30"
                    )}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">{q.subject || "General"}</span>
                            <h4 className="text-sm font-medium text-muted-foreground">{q.topic || "Core Concept"}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isCurrentDiff && adaptiveMode && (
                            <span className="text-[9px] bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5" /> Target
                            </span>
                          )}
                          <Badge variant="outline" className={cn(
                            "text-[10px] h-5 shrink-0",
                            q.difficulty === "EASY" ? "text-success border-success/30 bg-success/5" :
                            q.difficulty === "HARD" ? "text-destructive border-destructive/30 bg-destructive/5" :
                            "text-info border-info/30 bg-info/5"
                          )}>
                            {q.difficulty}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-lg font-display font-medium leading-relaxed mb-6">{q.text}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                          {q.tags.map((t: any) => (
                            <Badge key={t.id} variant="secondary" className="text-[10px] bg-secondary/50 text-muted-foreground">
                              #{t.name}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "text-xs font-semibold gap-2 shrink-0",
                            isRevealed ? "text-primary" : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() => toggleReveal(q.id, null, q.difficulty as Difficulty)}
                        >
                          {isRevealed
                            ? <><EyeOff className="h-4 w-4" /> Hide</>
                            : <><Eye className="h-4 w-4" /> Reveal Answer</>
                          }
                        </Button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isRevealed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-primary/5 border-t border-primary/10 px-6 py-4"
                        >
                          <div className="flex gap-3">
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="text-xs font-bold uppercase tracking-widest text-primary/70 block mb-1">Suggested Answer</span>
                              <p className="text-sm leading-relaxed text-foreground/90 font-medium">{q.answer}</p>
                            </div>
                          </div>
                          
                          {/* ── Training Module Prompt ── */}
                          {adaptiveMode && (
                            <div className="mt-4 pt-4 border-t border-primary/10 flex flex-col items-start">
                              <p className="text-xs font-bold uppercase tracking-widest text-warning mb-2 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5" /> Need a refresher?
                              </p>
                              <a
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q.subject || q.topic || 'Aptitude')}+tutorial+interview`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary bg-secondary hover:bg-secondary/80 px-4 py-2.5 rounded-xl transition-all border border-border/50 shadow-sm"
                              >
                                <Video className="h-4 w-4 text-warning" />
                                <span className="font-medium">Watch 10-minute module on {q.subject || q.topic || 'Core Concept'}</span>
                                <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                              </a>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* ── Sidebar / Stats ── */}
        <div className="space-y-5">

          {/* Adaptive session stats */}
          {adaptiveMode && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-5 rounded-2xl border border-primary/20 bg-primary/5">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2 text-primary">
                <Zap className="h-4 w-4" /> Adaptive Session
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Session Accuracy</span>
                    <span className="font-bold">{sessionAcc}%</span>
                  </div>
                  <Progress value={sessionAcc} className="h-2 bg-primary/10" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
                    <p className="text-muted-foreground">Answered</p>
                    <p className="font-bold text-base">{sessionTotal}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
                    <p className="text-muted-foreground">Correct</p>
                    <p className="font-bold text-base text-success">{sessionCorrect}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-secondary/30 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1.5 tracking-wider">Current Target</p>
                  <div className="flex items-center justify-between">
                    <Badge className={cn("font-bold text-xs",
                      adaptiveDiff === "EASY" ? "bg-success/15 text-success border-success/20" :
                      adaptiveDiff === "HARD" ? "bg-destructive/15 text-destructive border-destructive/20" :
                      "bg-primary/15 text-primary border-primary/20"
                    )}>
                      {adaptiveDiff}
                    </Badge>
                    <TrendIcon className={cn("h-4 w-4", trendColor)} />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground text-center italic">
                  Difficulty recalibrates after every 3 reveals
                </p>
              </div>
            </motion.div>
          )}

          {/* Manual progress */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-warning" />
                <h3 className="font-display font-bold">Your Progress</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Revealed</span>
                  <span className="font-bold">{revealedIds.size} / {filteredQuestions.length}</span>
                </div>
                <Progress value={(revealedIds.size / Math.max(filteredQuestions.length, 1)) * 100} className="h-2" />
              </div>
            </div>
            <Sparkles className="absolute -bottom-4 -right-4 h-24 w-24 text-primary/5 -rotate-12" />
          </div>

          {/* Topics to master */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" /> Topics to Master
            </h3>
            <div className="space-y-3">
              {allTags.slice(0, 6).map((tag: any) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={cn(
                    "w-full flex items-center justify-between text-xs group rounded-lg px-3 py-2 transition-all",
                    selectedTag === tag ? "bg-primary/10 text-primary" : "hover:bg-secondary/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="font-medium">{tag}</span>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentTraining;
