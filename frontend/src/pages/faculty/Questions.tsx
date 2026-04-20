import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload as UploadIcon,
  FileSearch,
  CheckCircle2,
  X,
  Loader2,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { extractQuestions, saveQuestions, Question } from "@/api/question.api";
import { cn } from "@/lib/utils";

type Step = "upload" | "extracting" | "validating" | "review" | "success";

interface ValidationIssue {
  questionIndex: number;
  severity: "error" | "warning" | "info";
  message: string;
}

// Sanity check engine
function validateQuestions(questions: Question[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  questions.forEach((q, i) => {
    // Error: missing question text
    if (!q.text || q.text.trim().length < 5) {
      issues.push({ questionIndex: i, severity: "error", message: "Question text is missing or too short." });
    }

    // Error: missing answer
    if (!q.answer || q.answer.trim() === "") {
      issues.push({ questionIndex: i, severity: "error", message: "No answer provided — cannot auto-grade this question." });
    }

    // Error: MCQ with no options
    if (q.type === "MCQ" && (!Array.isArray(q.options) || q.options.length < 2)) {
      issues.push({ questionIndex: i, severity: "error", message: "MCQ question has fewer than 2 options." });
    }

    // Error: MCQ answer not in options
    if (q.type === "MCQ" && Array.isArray(q.options) && q.options.length > 0 && q.answer) {
      if (!q.options.includes(q.answer)) {
        issues.push({ questionIndex: i, severity: "error", message: `Answer "${q.answer}" is not one of the provided options.` });
      }
    }

    // Warning: duplicate answer across options
    if (q.type === "MCQ" && Array.isArray(q.options)) {
      const uniq = new Set(q.options.map(o => o.trim().toLowerCase()));
      if (uniq.size < q.options.length) {
        issues.push({ questionIndex: i, severity: "warning", message: "Two or more options appear identical." });
      }
    }

    // Warning: very short answer (ambiguous)
    if (q.answer && q.answer.trim().split(" ").length < 2 && q.type !== "MCQ") {
      issues.push({ questionIndex: i, severity: "warning", message: "Answer is very short — may be ambiguous for descriptive grading." });
    }

    // Info: no tags
    if (!q.tags || q.tags.length === 0) {
      issues.push({ questionIndex: i, severity: "info", message: "No tags assigned — question won't appear in filtered training views." });
    }

    // Info: missing subject
    if (!q.subject) {
      issues.push({ questionIndex: i, severity: "info", message: "No subject set — will appear under 'General' in Training Center." });
    }
  });

  // Duplicate question text detection
  const seen = new Map<string, number>();
  questions.forEach((q, i) => {
    const key = q.text?.trim().toLowerCase().slice(0, 60);
    if (!key) return;
    if (seen.has(key)) {
      issues.push({ questionIndex: i, severity: "warning", message: `Possible duplicate of Q${(seen.get(key) as number) + 1}.` });
    } else {
      seen.set(key, i);
    }
  });

  return issues;
}

const SEVERITY_STYLE = {
  error:   { badge: "bg-destructive/10 text-destructive border-destructive/20",  icon: AlertCircle,   ring: "ring-2 ring-destructive/30" },
  warning: { badge: "bg-warning/10 text-warning border-warning/20",              icon: AlertTriangle,  ring: "ring-2 ring-warning/30" },
  info:    { badge: "bg-info/10 text-info border-info/20",                       icon: Info,           ring: "" },
};

const Questions = () => {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [dismissedIssues, setDismissedIssues] = useState<Set<string>>(new Set());

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let selectedFile: File | null = null;

    if ("dataTransfer" in e) {
      e.preventDefault();
      setIsDragOver(false);
      selectedFile = e.dataTransfer.files[0];
    } else {
      selectedFile = e.target.files?.[0] || null;
    }

    if (!selectedFile) return;

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "xlsx", "xls", "csv"].includes(ext || "")) {
      toast.error("Unsupported file format", { description: "Please upload PDF or Excel files." });
      return;
    }

    setFile(selectedFile);
    setStep("extracting");

    try {
      const response = await extractQuestions(selectedFile);
      if (response.success) {
        const extracted: Question[] = response.data;

        // Run sanity check
        setStep("validating");
        await new Promise(r => setTimeout(r, 800)); // brief scan animation
        const found = validateQuestions(extracted);
        setIssues(found);
        setDismissedIssues(new Set());
        setQuestions(extracted);
        setStep("review");

        const errors = found.filter(i => i.severity === "error").length;
        const warnings = found.filter(i => i.severity === "warning").length;
        if (errors > 0) {
          toast.error(`Sanity check: ${errors} error${errors > 1 ? "s" : ""} found`, { description: "Review flagged questions before saving." });
        } else if (warnings > 0) {
          toast.warning(`Sanity check: ${warnings} warning${warnings > 1 ? "s" : ""} found`, { description: "Review suggested improvements." });
        } else {
          toast.success(`Extraction complete — all ${extracted.length} questions passed validation ✓`);
        }
      }
    } catch (error: any) {
      toast.error("Extraction failed", { description: error.message });
      setStep("upload");
    }
  };

  const handleUpdateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
    // Re-validate on edit
    const newIssues = validateQuestions(updated);
    setIssues(newIssues);
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    setIssues(validateQuestions(updated));
  };

  const handleSaveAll = async () => {
    const errorCount = issues.filter(i => i.severity === "error").length;
    if (errorCount > 0) {
      toast.error(`Fix ${errorCount} error${errorCount > 1 ? "s" : ""} before saving`, { description: "Questions with errors cannot be saved." });
      return;
    }
    const toastId = toast.loading("Saving question bank...");
    try {
      await saveQuestions(questions);
      setStep("success");
      toast.success("Success!", { id: toastId, description: `${questions.length} questions saved.` });
    } catch (error: any) {
      toast.error("Failed to save", { id: toastId, description: error.message });
    }
  };

  const dismissIssue = (key: string) => setDismissedIssues(prev => new Set([...prev, key]));

  const getIssuesFor = (idx: number) =>
    issues.filter(i => i.questionIndex === idx && !dismissedIssues.has(`${i.questionIndex}-${i.message}`));

  const errorCount = issues.filter(i => i.severity === "error" && !dismissedIssues.has(`${i.questionIndex}-${i.message}`)).length;
  const warnCount = issues.filter(i => i.severity === "warning" && !dismissedIssues.has(`${i.questionIndex}-${i.message}`)).length;
  const infoCount = issues.filter(i => i.severity === "info" && !dismissedIssues.has(`${i.questionIndex}-${i.message}`)).length;

  return (
    <DashboardLayout role="faculty" title="Question Bank" subtitle="Build and manage your practice materials with AI extraction and automatic validation.">
      <AnimatePresence mode="wait">

        {step === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-card rounded-2xl p-12 text-center">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileUpload}
              className={cn(
                "border-2 border-dashed rounded-xl p-16 transition-all duration-300 cursor-pointer group",
                isDragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-secondary/30"
              )}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input id="file-upload" type="file" className="hidden" accept=".pdf,.xlsx,.xls,.csv" onChange={handleFileUpload} />
              <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-glow">
                <UploadIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-2">Upload Question Paper</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Drop your PDF or Excel file here. Our AI extracts questions — then the Sanity Checker validates them automatically.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
                <span className="flex items-center gap-1.5"><FileSearch className="h-3.5 w-3.5" /> PDF Supported</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="flex items-center gap-1.5"><Save className="h-3.5 w-3.5" /> Excel Auto-Map</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-success" /> Auto Validation</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === "extracting" && (
          <motion.div key="extracting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-20 text-center flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="relative h-24 w-24 mb-8">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-display font-semibold mb-2">Analyzing Document...</h3>
            <p className="text-muted-foreground animate-pulse">AI is identifying questions, answers, and options from your file.</p>
          </motion.div>
        )}

        {step === "validating" && (
          <motion.div key="validating" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-20 text-center flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="relative h-24 w-24 mb-8">
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-success/20 border-t-success rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center text-success">
                <ShieldCheck className="h-8 w-8 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-display font-semibold mb-2">Running Sanity Check...</h3>
            <p className="text-muted-foreground animate-pulse">Validating answers, options, duplicates, and ambiguity...</p>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Sticky toolbar */}
            <div className="flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-16 z-30 py-4 border-b border-border gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="px-3 py-1 text-primary border-primary/20 bg-primary/5">
                  {questions.length} Questions
                </Badge>
                {errorCount > 0 && (
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errorCount} error{errorCount > 1 ? "s" : ""}
                  </Badge>
                )}
                {warnCount > 0 && (
                  <Badge className="bg-warning/10 text-warning border-warning/20 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {warnCount} warning{warnCount > 1 ? "s" : ""}
                  </Badge>
                )}
                {infoCount > 0 && (
                  <Badge className="bg-info/10 text-info border-info/20 flex items-center gap-1">
                    <Info className="h-3 w-3" /> {infoCount} suggestion{infoCount > 1 ? "s" : ""}
                  </Badge>
                )}
                {errorCount === 0 && warnCount === 0 && (
                  <Badge className="bg-success/10 text-success border-success/20 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> All clear
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button variant="outline" onClick={() => setStep("upload")}>Discard</Button>
                <Button
                  onClick={handleSaveAll}
                  disabled={errorCount > 0}
                  className={cn("shadow-glow", errorCount > 0 ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground")}
                >
                  {errorCount > 0 ? `Fix ${errorCount} error${errorCount > 1 ? "s" : ""} first` : <>Save to Bank <ArrowRight className="h-4 w-4 ml-2" /></>}
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              {questions.map((q, idx) => {
                const qIssues = getIssuesFor(idx);
                const hasError = qIssues.some(i => i.severity === "error");
                const hasWarn = qIssues.some(i => i.severity === "warning");

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={cn(
                      "glass-card rounded-xl p-6 relative group transition-all border",
                      hasError ? "border-destructive/40 bg-destructive/[0.02]" :
                      hasWarn ? "border-warning/30 bg-warning/[0.02]" :
                      "border-border/50 hover:ring-1 hover:ring-primary/30"
                    )}
                  >
                    {/* Issue flags */}
                    {qIssues.length > 0 && (
                      <div className="mb-4 space-y-1.5">
                        {qIssues.map((issue, ii) => {
                          const s = SEVERITY_STYLE[issue.severity];
                          const IssueIcon = s.icon;
                          const key = `${issue.questionIndex}-${issue.message}`;
                          return (
                            <div key={ii} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium", s.badge)}>
                              <IssueIcon className="h-3.5 w-3.5 shrink-0" />
                              <span className="flex-1">{issue.message}</span>
                              <button onClick={() => dismissIssue(key)} className="opacity-50 hover:opacity-100 transition-opacity ml-1">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-md bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">{idx + 1}</span>
                        {qIssues.length === 0 && <CheckCircle2 className="h-4 w-4 text-success" />}
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(idx)}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-[1fr_300px] gap-8">
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Question Text</label>
                          <Textarea
                            value={q.text}
                            onChange={(e) => handleUpdateQuestion(idx, "text", e.target.value)}
                            className="min-h-[100px] bg-secondary/30 border-border/60 focus:bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Correct Answer</label>
                          <Textarea
                            value={q.answer}
                            onChange={(e) => handleUpdateQuestion(idx, "answer", e.target.value)}
                            className="bg-secondary/30 border-border/60 focus:bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-5 md:pt-0">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Difficulty</label>
                          <div className="flex gap-2">
                            {["EASY", "MEDIUM", "HARD"].map(level => (
                              <button
                                key={level}
                                onClick={() => handleUpdateQuestion(idx, "difficulty", level)}
                                className={cn(
                                  "flex-1 py-1.5 text-[10px] font-bold rounded-md border transition-all",
                                  q.difficulty === level
                                    ? "bg-primary border-primary text-white"
                                    : "bg-secondary/50 border-border/60 text-muted-foreground hover:bg-secondary"
                                )}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Subject / Topic</label>
                          <div className="space-y-2">
                            <Input
                              placeholder="e.g. Computer Science"
                              className="h-8 text-xs bg-secondary/30"
                              value={q.subject || ""}
                              onChange={(e) => handleUpdateQuestion(idx, "subject", e.target.value)}
                            />
                            <Input
                              placeholder="e.g. Data Structures"
                              className="h-8 text-xs bg-secondary/30"
                              value={q.topic || ""}
                              onChange={(e) => handleUpdateQuestion(idx, "topic", e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block px-1">Tags</label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {q.tags?.map(t => (
                              <Badge key={t} variant="secondary" className="text-[10px] flex items-center gap-1 pr-1">
                                {t}
                                <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => {
                                  const newTags = q.tags?.filter(tag => tag !== t);
                                  handleUpdateQuestion(idx, "tags", newTags);
                                }} />
                              </Badge>
                            ))}
                            <button
                              className="h-5 w-5 rounded-full border border-border border-dashed flex items-center justify-center hover:bg-secondary"
                              onClick={() => {
                                const tag = prompt("Enter tag name:");
                                if (tag) handleUpdateQuestion(idx, "tags", [...(q.tags || []), tag]);
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="pt-8 flex justify-center pb-12">
              <Button onClick={() => setStep("upload")} variant="outline" className="mr-4">Add More Files</Button>
              <Button
                onClick={handleSaveAll}
                disabled={errorCount > 0}
                className={cn("px-12 shadow-glow", errorCount > 0 ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground")}
              >
                Confirm & Save All Questions
              </Button>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-20 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-success/15 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h3 className="text-3xl font-display font-semibold mb-2">Sync Complete!</h3>
            <p className="text-muted-foreground mb-8">Your validated questions are now in the bank and available for assessments and training.</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setStep("upload")}>Upload Another</Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Questions;
