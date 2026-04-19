import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Filter,
  Sparkles,
  Trophy,
  BrainCircuit,
  Eye,
  EyeOff
} from "lucide-react";
import { getQuestions, Question } from "@/api/question.api";
import { StudentAPI } from "@/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const StudentTraining = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [showPersonalized, setShowPersonalized] = useState(false);

  useEffect(() => {
    fetchQuestions();
    // Derive weak topics from real results (attempts where score < 60%)
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
    } catch (error) {
      toast.error("Failed to load training materials");
    } finally {
      setLoading(false);
    }
  };

  const toggleReveal = (id: string) => {
    const newSet = new Set(revealedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setRevealedIds(newSet);
  };

  const allTags = Array.from(new Set(questions.flatMap(q => q.tags.map((t: any) => t.name))));

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase()) || 
                         q.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || q.tags.some((t: any) => t.name === selectedTag);
    const matchesWeak = !showPersonalized || weakTopics.length === 0 ||
      weakTopics.some(w => q.subject?.toLowerCase().includes(w.toLowerCase()) || q.topic?.toLowerCase().includes(w.toLowerCase()));
    return matchesSearch && matchesTag && matchesWeak;
  });

  return (
    <DashboardLayout 
      role="student" 
      title="Training Center" 
      subtitle="Master concepts through interactive practice questions."
    >
      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
          {/* Personalized Banner */}
          {weakTopics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
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
            <Button variant="outline" className="h-11 px-5 border-border/50">
              <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
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
              filteredQuestions.map((q, idx) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card rounded-2xl overflow-hidden group border border-border/50 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">{q.subject || "General"}</span>
                          <h4 className="text-sm font-medium text-muted-foreground">{q.topic || "Core Concept"}</h4>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[10px] h-5",
                        q.difficulty === "EASY" ? "text-success border-success/30 bg-success/5" :
                        q.difficulty === "HARD" ? "text-destructive border-destructive/30 bg-destructive/5" :
                        "text-info border-info/30 bg-info/5"
                      )}>
                        {q.difficulty}
                      </Badge>
                    </div>

                    <p className="text-lg font-display font-medium leading-relaxed mb-6">
                      {q.text}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
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
                          "text-xs font-semibold gap-2",
                          revealedIds.has(q.id) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => toggleReveal(q.id)}
                      >
                        {revealedIds.has(q.id) ? <><EyeOff className="h-4 w-4" /> Hide Answer</> : <><Eye className="h-4 w-4" /> Reveal Answer</>}
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {revealedIds.has(q.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-primary/5 border-t border-primary/10 px-6 py-4"
                      >
                        <div className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary/70 block mb-1">Suggested Answer</span>
                            <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                              {q.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-warning" />
                <h3 className="font-display font-bold">Your Progress</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Questions Answered</span>
                  <span className="font-bold">{revealedIds.size}</span>
                </div>
                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((revealedIds.size / Math.max(questions.length, 1)) * 100, 100)}%` }}
                    className="h-full bg-gradient-to-r from-primary to-primary/60"
                  />
                </div>
              </div>
            </div>
            <Sparkles className="absolute -bottom-4 -right-4 h-24 w-24 text-primary/5 -rotate-12" />
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              Topics to Master
            </h3>
            <div className="space-y-3">
              {allTags.slice(0, 5).map((tag: any) => (
                <div key={tag} className="flex items-center justify-between text-xs group cursor-pointer hover:text-primary transition-colors">
                  <span className="text-muted-foreground group-hover:text-primary transition-colors">{tag}</span>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentTraining;
