import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Clock, CheckCircle2, PlayCircle, BookOpen, Brain } from "lucide-react";
import { StudentAPI } from "@/api";
import type { TrainingModule } from "@/data/mock";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TestRunner } from "@/components/TestRunner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = ["All", "Coding", "Aptitude", "Core CS", "Soft Skills"] as const;

const StudentTraining = () => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const [quizModule, setQuizModule] = useState<TrainingModule | null>(null);

  useEffect(() => {
    StudentAPI.trainingModules().then(setModules);
  }, []);

  const filtered = useMemo(
    () => (filter === "All" ? modules : modules.filter((m) => m.category === filter)),
    [filter, modules],
  );

  const recommended = modules.filter((m) => m.recommended);

  const completionByCategory = useMemo(() => {
    const cats = ["Coding", "Aptitude", "Core CS", "Soft Skills"] as const;
    return cats.map((c) => {
      const items = modules.filter((m) => m.category === c);
      const avg = items.length ? Math.round(items.reduce((s, m) => s + m.progress, 0) / items.length) : 0;
      return { category: c, percent: avg, count: items.length };
    });
  }, [modules]);

  const updateProgress = async (id: string, progress: number) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, progress } : m)));
    await StudentAPI.updateModuleProgress(id, progress);
    if (progress === 100) toast.success("Module completed 🎉");
  };

  return (
    <DashboardLayout role="student" title="Training" subtitle="Personalised modules to close your skill gaps fast.">
      {/* Completion summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {completionByCategory.map((c, i) => (
          <motion.div
            key={c.category}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.category}</p>
              <Badge variant="outline" className="text-[10px]">{c.count}</Badge>
            </div>
            <p className="text-2xl font-display font-bold mt-2">{c.percent}%</p>
            <Progress value={c.percent} className="h-1.5 mt-2" />
          </motion.div>
        ))}
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold">Recommended for you</h3>
            <Badge className="bg-primary/15 text-primary border-primary/30">AI-picked</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommended.map((m) => (
              <div key={m.id} className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="font-medium">{m.title}</p>
                <p className="text-xs text-primary mt-1">{m.reason}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-muted-foreground">{m.estimatedMin}m · {m.difficulty}</span>
                  <Button size="sm" className="h-7 text-xs bg-gradient-primary text-primary-foreground hover:opacity-90">
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All modules */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="space-y-4">
        <TabsList className="bg-secondary/50 flex-wrap h-auto">
          {CATEGORIES.map((c) => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}
        </TabsList>
        <TabsContent value={filter}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="glass-card rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "rounded-lg p-2.5",
                      m.category === "Coding" && "bg-primary/10 text-primary",
                      m.category === "Aptitude" && "bg-info/10 text-info",
                      m.category === "Core CS" && "bg-warning/10 text-warning",
                      m.category === "Soft Skills" && "bg-success/10 text-success",
                    )}>
                      {m.category === "Coding" ? <BookOpen className="h-5 w-5" /> :
                       m.category === "Aptitude" ? <Brain className="h-5 w-5" /> :
                       m.category === "Core CS" ? <BookOpen className="h-5 w-5" /> :
                       <Sparkles className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{m.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">{m.category}</Badge>
                        <span className="text-[10px] text-muted-foreground">{m.difficulty}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />{m.estimatedMin}m
                        </span>
                      </div>
                    </div>
                  </div>
                  {m.progress === 100 && (
                    <Badge className="bg-success/15 text-success border-success/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Done
                    </Badge>
                  )}
                </div>
                <Progress value={m.progress} className="h-2" />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted-foreground">{m.progress}% complete</p>
                  <div className="flex gap-2">
                    {m.hasMockTest && (
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setQuizModule(m)}>
                        <PlayCircle className="h-3.5 w-3.5 mr-1" /> Mock quiz
                      </Button>
                    )}
                    {m.progress < 100 ? (
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => updateProgress(m.id, Math.min(100, m.progress + 25))}
                      >
                        {m.progress === 0 ? "Start" : "Continue"} ({Math.min(100, m.progress + 25)}%)
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => updateProgress(m.id, 0)}>
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!quizModule} onOpenChange={(o) => !o && setQuizModule(null)}>
        <DialogContent className="max-w-3xl p-0 gap-0 max-h-[90vh] overflow-hidden">
          {quizModule && (
            <TestRunner
              shortDuration
              test={{ id: `quiz-${quizModule.id}`, title: `Mock quiz · ${quizModule.title}`, subject: quizModule.category, durationMin: 3 }}
              onClose={() => setQuizModule(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudentTraining;
