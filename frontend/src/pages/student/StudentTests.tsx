import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  CalendarDays, Clock, BookOpen, Trophy, 
  ChevronRight, Sparkles, Timer, Zap,
  BarChart3, ShieldCheck, Target,
  MoreVertical, Search
} from "lucide-react";
import { StudentAPI } from "@/api";
import type { ScheduledTest } from "@/data/mock";
import { cn } from "@/lib/utils";

const StudentTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<ScheduledTest[]>([]);
  const [results, setResults] = useState<Awaited<ReturnType<typeof StudentAPI.results>>>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    StudentAPI.tests().then(setTests);
    StudentAPI.results().then(setResults);
  }, []);

  const upcoming = tests.filter((t) => !t.hasAttempted && (searchTerm === "" || t.title.toLowerCase().includes(searchTerm.toLowerCase())));
  const completed = tests.filter((t) => t.hasAttempted && (searchTerm === "" || t.title.toLowerCase().includes(searchTerm.toLowerCase())));

  return (
    <DashboardLayout 
      role="student" 
      title="Assessment Portal" 
      subtitle="Track your mastery, participate in mock drills, and boost your behavioral readiness scores."
    >
      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between">
          <TabsList className="bg-secondary/30 backdrop-blur-md p-1 h-12 rounded-xl border border-white/5">
            <TabsTrigger value="upcoming" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Live & Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Past Performance
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary/20 border border-white/5 rounded-xl h-12 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent value="upcoming" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.length === 0 && (
                <div className="col-span-full glass-card rounded-2xl p-16 text-center border-dashed border-2 border-white/5">
                  <div className="h-16 w-16 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold">No active assessments</h3>
                  <p className="text-muted-foreground mt-1 max-w-xs mx-auto text-sm">You're all caught up! New tests scheduled by your faculty will appear here.</p>
                </div>
              )}
              {upcoming.map((t, i) => (
                <motion.div
                  key={t.id || `upcoming-${i}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative glass-card rounded-3xl p-6 border-white/5 hover:border-primary/20 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)] transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/5"><MoreVertical className="h-4 w-4" /></Button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase font-bold tracking-tight mb-1">
                          {t.type}
                        </Badge>
                        <h3 className="font-display font-bold text-lg leading-none group-hover:text-primary transition-colors">{t.title}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-secondary/20 rounded-2xl p-3 border border-white/5">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold"><Timer className="h-3 w-3" /> Duration</p>
                        <p className="font-display font-bold text-sm mt-1">{t.durationMin} Minutes</p>
                      </div>
                      <div className="bg-secondary/20 rounded-2xl p-3 border border-white/5">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold"><BookOpen className="h-3 w-3" /> Questions</p>
                        <p className="font-display font-bold text-sm mt-1">{t.questionsCount} MCQs</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                       <div className="flex items-center gap-2">
                         <div className="flex -space-x-2">
                           {[1,2,3].map(i => <div key={i} className="h-5 w-5 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold">U{i}</div>)}
                         </div>
                         <span className="text-[10px] text-muted-foreground">+12 others attempting</span>
                       </div>
                       <p className="text-[10px] font-bold text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                    </div>

                    <Button
                      className="w-full h-12 bg-gradient-primary text-primary-foreground font-bold rounded-2xl shadow-glow overflow-hidden relative group/btn"
                      onClick={() => navigate(`/student/test/${t.id}`)}
                    >
                      <Sparkles className="h-4 w-4 mr-2 group-hover/btn:animate-pulse" />
                      Start Assessment
                      <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completed.map((t, idx) => {
                  const r = results.find((x) => x.id === t.id);
                  if (!r) return null;
                  return (
                    <div key={t.id || `comp-${idx}`} className="glass-card rounded-3xl p-6 border-white/5 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                               <ShieldCheck className="h-5 w-5" />
                             </div>
                             <div>
                               <h3 className="font-bold text-lg leading-tight">{t.title}</h3>
                               <p className="text-xs text-muted-foreground mt-0.5">{t.subject} • Completed</p>
                             </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Accuracy</p>
                              <div className="flex items-center gap-2">
                                {r.isReleased ? (
                                  <>
                                    <span className={cn(
                                      "font-display font-bold text-xl",
                                      (r.score as number) >= 80 ? "text-success" : (r.score as number) >= 50 ? "text-warning" : "text-destructive"
                                    )}>{r.score}%</span>
                                    <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                                      <div className="h-full bg-success" style={{ width: `${r.score}%` }} />
                                    </div>
                                  </>
                                ) : (
                                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Pending Review</Badge>
                                )}
                              </div>
                            </div>
                            <div className="w-px h-10 bg-white/5" />
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Rank</p>
                              {r.isReleased ? (
                                <p className="font-display font-bold text-xl text-primary">{r.percentile}th <span className="text-[10px] text-muted-foreground">%tile</span></p>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">Updating...</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 text-right">
                           <div className="h-12 w-12 rounded-full border-2 border-white/10 flex items-center justify-center flex-col">
                             <span className="text-[10px] font-bold text-muted-foreground">Q</span>
                             <span className="text-xs font-bold leading-none">{r.isReleased ? `${r.correct}/${r.total}` : "?"}</span>
                           </div>
                           <p className="text-[10px] text-muted-foreground font-medium tabular-nums flex items-center gap-1">
                             <Clock className="h-3 w-3" /> {r.timeTakenMin}m elapsed
                           </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
                        <Button variant="outline" className="flex-1 rounded-xl h-11 border-white/10 hover:bg-white/5">
                          View Analysis
                        </Button>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-secondary/20">
                           <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="glass-card rounded-3xl overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                   <h4 className="font-bold flex items-center gap-2"><Zap className="h-4 w-4 text-warning" /> Assessment Ledger</h4>
                   <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Export PDF</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                        <th className="p-6 font-bold pb-4">Assessment Name</th>
                        <th className="p-6 font-bold pb-4">Focus Area</th>
                        <th className="p-6 font-bold pb-4">Score</th>
                        <th className="p-6 font-bold pb-4">Behavioral Score</th>
                        <th className="p-6 font-bold pb-4">Status</th>
                        <th className="p-6 font-bold pb-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {results.map((r) => (
                        <tr key={r.id} className="group hover:bg-white/[0.01] transition-colors">
                          <td className="p-6">
                            <p className="font-bold">{r.title}</p>
                            <p className="text-[10px] text-muted-foreground">{r.date}</p>
                          </td>
                          <td className="p-6">
                            <Badge variant="outline" className="border-secondary/50 text-[10px]">{r.subject}</Badge>
                          </td>
                          <td className="p-6">
                            <span className="font-display font-bold text-lg">{r.isReleased ? `${r.score}%` : "---"}</span>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                               <div className="h-1.5 w-12 bg-white/5 rounded-full">
                                 <div className="h-full bg-primary" style={{ width: r.isReleased ? '85%' : '0%' }} />
                               </div>
                               <span className="text-xs font-mono text-primary">{r.isReleased ? "85" : "---"}</span>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(var(--success-rgb),0.5)]",
                                r.isReleased ? "bg-success" : "bg-warning animate-pulse"
                              )} />
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-tight",
                                r.isReleased ? "text-success" : "text-warning"
                              )}>{r.isReleased ? "Verified" : "Pending"}</span>
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary transition-all rounded-lg h-8">
                              Analysis
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </DashboardLayout>
  );
};

export default StudentTests;
