import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentAPI } from "@/api";
import type { QuizQuestion, ScheduledTest } from "@/data/mock";
import { toast } from "sonner";

interface Props {
  test: ScheduledTest | { id: string; title: string; subject: string; durationMin: number; questionsCount?: number };
  onClose: () => void;
  shortDuration?: boolean; // for in-training quizzes (3 min)
}

type Phase = "intro" | "running" | "result";

export const TestRunner = ({ test, onClose, shortDuration }: Props) => {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const totalSeconds = (shortDuration ? 3 : test.durationMin) * 60;
  const [seconds, setSeconds] = useState(totalSeconds);
  const submittedRef = useRef(false);

  useEffect(() => {
    StudentAPI.quiz().then(setQuestions);
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const submit = (auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    StudentAPI.submitQuiz(test.id, answers);
    setPhase("result");
    if (auto) toast.warning("Time's up — auto-submitted");
  };

  const stats = useMemo(() => {
    const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;
    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    const percentile = Math.min(99, 40 + Math.round(score * 0.6));
    return { correct, total: questions.length, score, percentile };
  }, [answers, questions]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const pct = ((totalSeconds - seconds) / totalSeconds) * 100;
  const q = questions[current];

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 text-center">
            <h2 className="text-2xl font-display font-bold">{test.title}</h2>
            <p className="text-sm text-muted-foreground mt-2">{test.subject}</p>
            <div className="grid grid-cols-3 gap-3 my-6 max-w-md mx-auto">
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Duration</p>
                <p className="font-display font-bold">{shortDuration ? 3 : test.durationMin}m</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Questions</p>
                <p className="font-display font-bold">{questions.length || "..."}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Auto-submit</p>
                <p className="font-display font-bold">Yes</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              You can navigate between questions. Timer auto-submits at zero. Good luck!
            </p>
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                disabled={!questions.length}
                onClick={() => setPhase("running")}
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
              >
                Start test
              </Button>
            </div>
          </motion.div>
        )}

        {phase === "running" && q && (
          <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
            <div className="border-b border-border p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{test.title}</p>
                <p className="text-xs text-muted-foreground">Question {current + 1} of {questions.length}</p>
              </div>
              <div className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 font-mono font-semibold tabular-nums",
                seconds < 30 ? "bg-destructive/15 text-destructive animate-pulse" : "bg-primary/10 text-primary",
              )}>
                <Clock className="h-4 w-4" />
                {mm}:{ss}
              </div>
            </div>
            <Progress value={pct} className="h-1 rounded-none" />
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{q.topic}</p>
              <h3 className="text-lg font-display font-semibold mb-4">{q.question}</h3>
              <div className="space-y-2">
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                      className={cn(
                        "w-full text-left rounded-lg border p-3 text-sm transition-all",
                        selected ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-primary/50 hover:bg-secondary/40",
                      )}
                    >
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-border mr-3 text-xs font-mono">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="border-t border-border p-4 flex items-center justify-between gap-2">
              <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</Button>
              <div className="flex flex-wrap gap-1">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={cn(
                      "h-7 w-7 rounded text-[10px] font-mono",
                      i === current ? "bg-primary text-primary-foreground" :
                      answers[questions[i].id] !== undefined ? "bg-success/20 text-success" :
                      "bg-secondary text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              {current < questions.length - 1 ? (
                <Button onClick={() => setCurrent((c) => c + 1)} className="bg-primary text-primary-foreground hover:bg-primary/90">Next</Button>
              ) : (
                <Button onClick={() => submit(false)} className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">Submit</Button>
              )}
            </div>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div key="res" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="p-6 overflow-y-auto">
            <div className="text-center mb-6">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-3">
                <Trophy className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold">Test submitted</h2>
              <p className="text-sm text-muted-foreground">Here's how you did</p>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="rounded-lg bg-secondary/40 p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Score</p>
                <p className="text-xl font-display font-bold text-primary">{stats.score}%</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Correct</p>
                <p className="text-xl font-display font-bold">{stats.correct}/{stats.total}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Percentile</p>
                <p className="text-xl font-display font-bold">{stats.percentile}th</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Time</p>
                <p className="text-xl font-display font-bold">{Math.round((totalSeconds - seconds) / 60)}m</p>
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Question review</p>
            <div className="space-y-2">
              {questions.map((qq, i) => {
                const userIdx = answers[qq.id];
                const right = userIdx === qq.correctIndex;
                return (
                  <div key={qq.id} className={cn("rounded-lg border p-3 text-sm", right ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5")}>
                    <div className="flex items-start gap-2">
                      {right ? <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />}
                      <div className="flex-1">
                        <p className="font-medium">Q{i + 1}. {qq.question}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Correct: <span className="text-foreground">{qq.options[qq.correctIndex]}</span>
                          {userIdx !== undefined && !right && <> · Your answer: <span className="text-destructive">{qq.options[userIdx]}</span></>}
                          {userIdx === undefined && <> · <span className="text-warning">Not answered</span></>}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1 italic">{qq.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => { submittedRef.current = false; setAnswers({}); setCurrent(0); setSeconds(totalSeconds); setPhase("intro"); }}>Retake</Button>
              <Button onClick={onClose} className="bg-primary text-primary-foreground hover:bg-primary/90">Done</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
