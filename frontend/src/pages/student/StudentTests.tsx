import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Clock, BookOpen, Trophy, ChevronRight } from "lucide-react";
import { StudentAPI } from "@/api";
import type { ScheduledTest } from "@/data/mock";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TestRunner } from "@/components/TestRunner";

const StudentTests = () => {
  const [tests, setTests] = useState<ScheduledTest[]>([]);
  const [results, setResults] = useState<Awaited<ReturnType<typeof StudentAPI.results>>>([]);
  const [activeTest, setActiveTest] = useState<ScheduledTest | null>(null);
  const [reviewResult, setReviewResult] = useState<typeof results[number] | null>(null);

  useEffect(() => {
    StudentAPI.tests().then(setTests);
    StudentAPI.results().then(setResults);
  }, []);

  const upcoming = tests.filter((t) => t.status === "upcoming");
  const completed = tests.filter((t) => t.status === "completed");

  return (
    <DashboardLayout role="student" title="My Tests" subtitle="Practice mocks, see your scores, climb the leaderboard.">
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.length === 0 && (
            <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">No upcoming tests.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-5 hover:shadow-elevated transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="rounded-lg bg-primary/10 text-primary p-2.5">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">{t.type}</Badge>
                </div>
                <h3 className="font-display font-semibold text-lg">{t.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">Subject: {t.subject}</p>
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <div className="rounded-md bg-secondary/40 p-2">
                    <p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Date</p>
                    <p className="font-medium mt-0.5">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-md bg-secondary/40 p-2">
                    <p className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Duration</p>
                    <p className="font-medium mt-0.5">{t.durationMin} min</p>
                  </div>
                  <div className="rounded-md bg-secondary/40 p-2">
                    <p className="text-muted-foreground">Questions</p>
                    <p className="font-medium mt-0.5">{t.questionsCount}</p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">By {t.scheduledBy}</p>
                <Button
                  className="w-full mt-4 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                  onClick={() => setActiveTest(t)}
                >
                  Attempt mock test <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completed.map((t) => {
              const r = results.find((x) => x.id === t.id);
              return (
                <div key={t.id} className="glass-card rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display font-semibold">{t.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{t.subject} · {new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    {r && (
                      <div className="text-right">
                        <p className="text-2xl font-display font-bold text-primary">{r.score}%</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.percentile}th</p>
                      </div>
                    )}
                  </div>
                  {r && (
                    <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setReviewResult(r)}>
                      View detailed results
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 font-medium">Test</th>
                  <th className="p-4 font-medium">Subject</th>
                  <th className="p-4 font-medium">Score</th>
                  <th className="p-4 font-medium">Percentile</th>
                  <th className="p-4 font-medium hidden md:table-cell">Time</th>
                  <th className="p-4 font-medium hidden md:table-cell">Correct</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-t border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-medium">{r.title}</td>
                    <td className="p-4 text-muted-foreground">{r.subject}</td>
                    <td className="p-4 font-display font-semibold">{r.score}%</td>
                    <td className="p-4">
                      <Badge variant="outline">{r.percentile}th</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{r.timeTakenMin}m</td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{r.correct}/{r.total}</td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="ghost" className="text-primary" onClick={() => setReviewResult(r)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Test runner */}
      <Dialog open={!!activeTest} onOpenChange={(o) => !o && setActiveTest(null)}>
        <DialogContent className="max-w-3xl p-0 gap-0 max-h-[90vh] overflow-hidden">
          {activeTest && <TestRunner test={activeTest} onClose={() => setActiveTest(null)} />}
        </DialogContent>
      </Dialog>

      {/* Result review */}
      <Dialog open={!!reviewResult} onOpenChange={(o) => !o && setReviewResult(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{reviewResult?.title}</DialogTitle>
            <DialogDescription>Detailed result · {reviewResult?.date}</DialogDescription>
          </DialogHeader>
          {reviewResult && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-2xl font-display font-bold text-primary">{reviewResult.score}%</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-xs text-muted-foreground">Percentile</p>
                <p className="text-2xl font-display font-bold">{reviewResult.percentile}th</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-xs text-muted-foreground">Correct answers</p>
                <p className="text-2xl font-display font-bold">{reviewResult.correct}/{reviewResult.total}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-xs text-muted-foreground">Time taken</p>
                <p className="text-2xl font-display font-bold flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" /> {reviewResult.timeTakenMin}m
                </p>
              </div>
              <div className="col-span-2 rounded-lg border border-border p-3 text-sm">
                <Trophy className="h-4 w-4 text-warning inline mr-2" />
                You ranked in the <span className="font-semibold">{reviewResult.percentile}th percentile</span> of your batch.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudentTests;
