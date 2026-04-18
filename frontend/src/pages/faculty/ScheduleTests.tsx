import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
  CalendarDays, Clock, Users as UsersIcon, Send, 
  Upload as UploadIcon, FileText, BrainCircuit, 
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft,
  Search, BookOpen, Tag as TagIcon
} from "lucide-react";
import { FacultyAPI } from "@/api";
import type { FacultyMember, StudentRecord } from "@/data/mock";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEPARTMENTS = [
  "CSE",
  "ISE",
  "ECE",
  "MECH",
  "CIVIL",
  "Open to All"
];

const MOCK_EXTRACTED_QUESTIONS = [
  { id: 1, text: "Explain the difference between SQL and NoSQL databases.", tags: ["DBMS", "Software Engineering"], difficulty: "Medium" },
  { id: 2, text: "What is the time complexity of a binary search algorithm?", tags: ["DSA", "Algorithms"], difficulty: "Easy" },
  { id: 3, text: "Describe the four pillars of OOPs with real-world examples.", tags: ["Java", "OOPs"], difficulty: "Medium" },
  { id: 4, text: "How does the TCP three-way handshake process work?", tags: ["Networking", "Protocols"], difficulty: "Hard" },
  { id: 5, text: "A train 150m long passes a pole in 15 seconds. What is the speed of the train?", tags: ["Aptitude", "Time & Distance"], difficulty: "Easy" },
];

type Step = "details" | "upload" | "ai-process" | "review-tags" | "audience";

const ScheduleTests = () => {
  const [step, setStep] = useState<Step>("details");
  const [me, setMe] = useState<FacultyMember | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  
  // Test Details
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dept, setDept] = useState("CSE");
  const [category, setCategory] = useState("Core");
  
  // File Upload
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  
  // AI Extraction
  const [aiProgress, setAiProgress] = useState(0);
  const [extractedQuestions, setExtractedQuestions] = useState(MOCK_EXTRACTED_QUESTIONS);

  // Scheduling
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [scope, setScope] = useState<"all" | "mentees" | "select">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    FacultyAPI.me().then((m) => { 
      setMe(m); 
      setSubject(m.subjects[0] || "");
    });
    FacultyAPI.students().then(setStudents);
  }, []);

  // Clear selection when department changes to prevent cross-dept targeting
  useEffect(() => {
    setSelected(new Set());
  }, [dept]);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setStep("ai-process");
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      if (p >= 100) {
        clearInterval(interval);
        setAiProgress(100);
        setTimeout(() => setStep("review-tags"), 800);
      } else {
        setAiProgress(p);
      }
    }, 400);
  }, []);

  const filteredStudents = students.filter(s => {
    if (dept === "Open to All") return true;
    return s.branch === dept; 
  });

  const visible = scope === "select" ? filteredStudents : 
                  scope === "mentees" && me ? filteredStudents.filter((s) => me.menteeIds.includes(s.id)) : 
                  filteredStudents;

  const toggleStudent = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = async () => {
    if (!title || !date || !subject) { 
      toast.error("Please fill in all scheduling details"); 
      return; 
    }
    const targetIds = scope === "all" ? filteredStudents.map((s) => s.id) : 
                       scope === "mentees" ? (me?.menteeIds ?? []) : [...selected];
    
    await FacultyAPI.scheduleTest({
      title,
      subject: `${dept} - ${subject}`,
      type: category,
      date: `${date}T${time}:00`,
      durationMin: duration,
      questionsCount: extractedQuestions.length,
      status: "upcoming",
    });
    
    toast.success("Test Scheduled Successfully!", {
      description: `Test published for ${targetIds.length} students in ${dept}.`
    });
    setStep("details");
    setTitle("");
    setFile(null);
  };

  return (
    <DashboardLayout role="faculty" title="AI-Powered Test Scheduler" subtitle="Organize assessments with automated topic mapping and behavioral analytics.">
      
      {/* Stepper Header */}
      <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: "details", icon: BookOpen, label: "Configuration" },
          { id: "upload", icon: UploadIcon, label: "Question Paper" },
          { id: "review-tags", icon: BrainCircuit, label: "AI Analysis" },
          { id: "audience", icon: CalendarDays, label: "Finalize" },
        ].map((s, i) => {
          const isActive = step === s.id || (step === "ai-process" && s.id === "review-tags");
          const isDone = ["details", "upload", "ai-process", "review-tags", "audience"].indexOf(step) > 
                         ["details", "upload", "review-tags", "audience"].indexOf(s.id);
          
          return (
            <div key={s.id} className="flex items-center gap-3 shrink-0">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500",
                isActive ? "bg-gradient-primary text-primary-foreground shadow-glow" : 
                isDone ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"
              )}>
                {isDone ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
              </div>
              <div className="flex flex-col">
                <span className={cn("text-[10px] uppercase font-bold tracking-tighter", isActive ? "text-primary" : "text-muted-foreground")}>Step 0{i+1}</span>
                <span className={cn("text-xs font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
              </div>
              {i < 3 && <div className="ml-4 h-px w-8 bg-border" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: CONFIGURE & AUDIENCE */}
        {step === "details" && (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 glass-card rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-semibold">Assessment Context</h3>
                  <p className="text-xs text-muted-foreground">Select targets and syllabus for automated processing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Test Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Unit Test - II" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Target Department</Label>
                  <Select value={dept} onValueChange={setDept}>
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Syllabus Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {(me?.subjects ?? []).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Test Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Aptitude", "Core", "Technical", "Soft Skills"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button 
                  disabled={!title || !dept || !subject}
                  onClick={() => setStep("upload")} 
                  className="bg-gradient-primary text-primary-foreground px-8 shadow-glow"
                >
                  Confirm & Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 h-fit shrink-0">
              <Label className="flex items-center gap-2 font-bold mb-4"><UsersIcon className="h-4 w-4 text-primary" /> Enrollment Scope</Label>
              <Select value={scope} onValueChange={(v) => setScope(v as any)}>
                <SelectTrigger className="bg-secondary/20 mb-4"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Entire {dept === "Open to All" ? "Batch" : "Dept"}</SelectItem>
                  <SelectItem value="mentees">My Mentees</SelectItem>
                  <SelectItem value="select">Custom Select</SelectItem>
                </SelectContent>
              </Select>

              {scope === "select" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="max-h-[350px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                    {visible.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors">
                        <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground">{s.roll}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-border/50 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">
                  {scope === "select" ? `${selected.size} Selected` : `${visible.length} Total Targets`}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: UPLOAD */}
        {step === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="glass-card rounded-2xl p-12 text-center max-w-2xl mx-auto">
              <div className="mb-8 font-display">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Upload Documentation</h3>
                <p className="text-sm text-muted-foreground mt-1">AI will analyze questions for {dept}</p>
              </div>
              <label
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                className={cn(
                  "block border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all",
                  drag ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/40"
                )}
              >
                <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <UploadIcon className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium">Click to upload or drag paper</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, JSON supported</p>
              </label>
              <Button variant="ghost" onClick={() => setStep("details")} className="mt-8 text-muted-foreground"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Config</Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: AI PROCESSING */}
        {step === "ai-process" && (
          <motion.div key="ai-process" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-16 text-center max-w-2xl mx-auto">
            <BrainCircuit className="h-12 w-12 text-primary mx-auto mb-6 animate-pulse" />
            <h3 className="text-2xl font-display font-bold mb-2">Engaging AI Analyzer...</h3>
            <p className="text-sm text-muted-foreground mb-8">Mapping questions to core departmental competencies.</p>
            <Progress value={aiProgress} className="h-2 max-w-xs mx-auto" />
          </motion.div>
        )}

        {/* STEP 4: REVIEW TAGS */}
        {step === "review-tags" && (
          <motion.div key="review-tags" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Review Extracted Tags</h3>
              <Badge variant="outline" className="border-primary/30 text-primary"><Sparkles className="h-3 w-3 mr-1" /> AI Assisted</Badge>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {extractedQuestions.map((q) => (
                <div key={q.id} className="glass-card rounded-xl p-5 flex gap-6 hover:bg-secondary/10 transition-colors">
                  <div className="flex-1 text-sm font-medium leading-relaxed">{q.text}</div>
                  <div className="w-64 shrink-0 space-y-2 border-l border-border/50 pl-6">
                    <div className="flex flex-wrap gap-1">
                      {q.tags.map(t => <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0">#{t}</Badge>)}
                    </div>
                    <div className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      q.difficulty === "Easy" ? "text-success" : q.difficulty === "Medium" ? "text-warning" : "text-destructive"
                    )}>Difficulty: {q.difficulty}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end p-4 bg-secondary/20 rounded-xl border border-border/50">
              <Button onClick={() => setStep("audience")} className="bg-gradient-primary text-primary-foreground shadow-outer">
                Proceed to Scheduling <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: FINALIZE */}
        {step === "audience" && (
          <motion.div key="finalize" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="glass-card rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-2 font-bold text-lg"><Clock className="h-5 w-5 text-primary" /> Scheduling & Access</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Scheduled Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Duration (Minutes)</Label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} className="bg-secondary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Additional Instructions</Label>
                <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} placeholder="Provide context or syllabus details..." className="bg-secondary/50" />
              </div>
              <div className="pt-6 border-t border-border/50">
                <div className="flex items-center justify-between mb-4 bg-secondary/20 rounded-lg p-3">
                  <div className="text-[11px] text-muted-foreground uppercase font-bold">Summary: {visible.length} Students · {dept}</div>
                  <Badge className="bg-primary/20 text-primary border-0">{category}</Badge>
                </div>
                <Button onClick={submit} className="w-full h-12 bg-gradient-primary text-primary-foreground shadow-glow font-bold text-base">
                  <Send className="h-5 w-5 mr-3" /> Publish Test Schedule
                </Button>
              </div>
              <Button variant="ghost" onClick={() => setStep("review-tags")} className="w-full text-muted-foreground"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Review</Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </DashboardLayout>
  );
};

export default ScheduleTests;
