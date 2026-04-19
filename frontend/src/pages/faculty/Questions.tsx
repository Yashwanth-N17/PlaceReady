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
  Search
} from "lucide-react";
import { toast } from "sonner";
import { extractQuestions, saveQuestions, Question } from "@/api/question.api";
import { cn } from "@/lib/utils";

type Step = "upload" | "extracting" | "review" | "success";

const Questions = () => {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

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
        setQuestions(response.data);
        setStep("review");
        toast.success("Extraction complete", { description: `Found ${response.data.length} questions.` });
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
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (questions.length === 0) return;
    
    const toastId = toast.loading("Saving question bank...");
    try {
      await saveQuestions(questions);
      setStep("success");
      toast.success("Success!", { id: toastId, description: `${questions.length} questions have been added.` });
    } catch (error: any) {
      toast.error("Failed to save", { id: toastId, description: error.message });
    }
  };

  return (
    <DashboardLayout role="faculty" title="Question Bank" subtitle="Build and manage your practice materials with AI extraction.">
      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileUpload}
              className={cn(
                "border-2 border-dashed rounded-xl p-16 transition-all duration-300 cursor-pointer group",
                isDragOver ? "border-primary bg-primary/5 scale-102" : "border-border hover:border-primary/50 hover:bg-secondary/30"
              )}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                accept=".pdf,.xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
              <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-glow">
                <UploadIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-2">Upload Question Paper</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Drop your PDF or Excel file here. Our AI will automatically extract questions, answers, and tags.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4 text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
                <span className="flex items-center gap-1.5"><FileSearch className="h-3.5 w-3.5" /> PDF Supported</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="flex items-center gap-1.5"><Save className="h-3.5 w-3.5" /> Excel Auto-Map</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === "extracting" && (
          <motion.div
            key="extracting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-20 text-center flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="relative h-24 w-24 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-display font-semibold mb-2">Analyzing Document...</h3>
            <p className="text-muted-foreground animate-pulse">Our AI is identifying questions and answers from your file.</p>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between bg-background/50 backdrop-blur-md sticky top-16 z-30 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1 text-primary border-primary/20 bg-primary/5">
                  {questions.length} Questions Extracted
                </Badge>
                <div className="text-sm text-muted-foreground hidden md:block">
                  Review and edit before saving to the central bank.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setStep("upload")}>Discard</Button>
                <Button onClick={handleSaveAll} className="bg-primary text-primary-foreground shadow-glow">
                  Save to Bank <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              {questions.map((q, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card rounded-xl p-6 relative group hover:ring-1 hover:ring-primary/30 transition-all border border-border/50"
                >
                  <button 
                    onClick={() => handleDeleteQuestion(idx)}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

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
                              {t} <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => {
                                const newTags = q.tags?.filter(tag => tag !== t);
                                handleUpdateQuestion(idx, "tags", newTags);
                              }} />
                            </Badge>
                          ))}
                          <button 
                            className="h-5 w-5 rounded-full border border-border border-dashed flex items-center justify-center hover:bg-secondary"
                            onClick={() => {
                              const tag = prompt("Enter tag name:");
                              if (tag) {
                                const newTags = [...(q.tags || []), tag];
                                handleUpdateQuestion(idx, "tags", newTags);
                              }
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="pt-8 flex justify-center pb-12">
              <Button onClick={() => setStep("upload")} variant="outline" className="mr-4">Add More Files</Button>
              <Button onClick={handleSaveAll} className="bg-primary text-primary-foreground px-12 shadow-glow">
                Confirm & Save All Questions
              </Button>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-20 text-center"
          >
            <div className="mx-auto h-20 w-20 rounded-full bg-success/15 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h3 className="text-3xl font-display font-semibold mb-2">Sync Complete!</h3>
            <p className="text-muted-foreground mb-8">Your questions are now uploaded and ready for review in the dashboard.</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setStep("upload")}>Upload Another</Button>
              <Button className="bg-primary text-primary-foreground">Go to Question Bank</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Questions;
