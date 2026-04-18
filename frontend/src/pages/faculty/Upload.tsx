import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Upload as UploadIcon, FileSpreadsheet, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SYSTEM_FIELDS = [
  { value: "name", label: "Student Name", required: true },
  { value: "roll", label: "Roll Number", required: true },
  { value: "email", label: "Email" },
  { value: "aptitude", label: "Aptitude Score" },
  { value: "coding", label: "Coding Score" },
  { value: "core", label: "Core Subject Score" },
  { value: "soft", label: "Soft Skills Score" },
  { value: "cgpa", label: "CGPA" },
  { value: "attendance", label: "Attendance %" },
];

// fuzzy-ish auto-suggest
const guess = (header: string): string | undefined => {
  const h = header.toLowerCase().replace(/[^a-z]/g, "");
  if (h.includes("name") && !h.includes("user")) return "name";
  if (h.includes("roll") || h === "regno" || h === "studentid") return "roll";
  if (h.includes("email") || h.includes("mail")) return "email";
  if (h.includes("apt")) return "aptitude";
  if (h.includes("code") || h.includes("dsa") || h.includes("program")) return "coding";
  if (h.includes("core") || h.includes("subject")) return "core";
  if (h.includes("soft") || h.includes("comm")) return "soft";
  if (h.includes("cgpa") || h.includes("gpa")) return "cgpa";
  if (h.includes("attend")) return "attendance";
  return undefined;
};

const MOCK_HEADERS = ["Student Name", "Roll No", "Email ID", "Apt Score", "DSA Score", "Core Avg", "Comm Skill", "CGPA", "Attendance%"];

type Step = 1 | 2 | 3 | 4 | 5;

const Upload = () => {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [saveMapping, setSaveMapping] = useState(true);
  const [progress, setProgress] = useState(0);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setStep(2);
    // simulate header detection
    setTimeout(() => {
      setHeaders(MOCK_HEADERS);
      const m: Record<string, string> = {};
      MOCK_HEADERS.forEach((h) => {
        const g = guess(h);
        if (g) m[h] = g;
      });
      setMapping(m);
      setStep(3);
    }, 1200);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const required = SYSTEM_FIELDS.filter((f) => f.required).map((f) => f.value);
  const mappedValues = Object.values(mapping);
  const missingRequired = required.filter((r) => !mappedValues.includes(r));

  const confirm = () => {
    if (missingRequired.length) {
      toast.error("Map required fields", { description: "Name and Roll Number are required." });
      return;
    }
    setStep(5);
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(iv); return 100; }
        return p + 4;
      });
    }, 60);
    setTimeout(() => {
      toast.success("156 students imported successfully", { description: saveMapping ? "Mapping saved for next time" : undefined });
    }, 1700);
  };

  const reset = () => {
    setStep(1); setFile(null); setHeaders([]); setMapping({}); setProgress(0);
  };

  const stepLabels = ["Upload", "Detect", "Map", "Review", "Process"];

  return (
    <DashboardLayout role="faculty" title="Upload student data" subtitle="Drop your Excel — we'll auto-map columns to system fields.">
      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between max-w-2xl">
        {stepLabels.map((label, i) => {
          const n = (i + 1) as Step;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                  done ? "bg-success text-background" :
                  active ? "bg-gradient-primary text-primary-foreground shadow-glow" :
                  "bg-secondary text-muted-foreground"
                )}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : n}
                </div>
                <span className={cn("text-[10px] uppercase tracking-wider", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={cn("flex-1 h-px mx-2 transition-colors", done ? "bg-success" : "bg-border")} />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-card rounded-xl p-8"
          >
            <label
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              className={cn(
                "block border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
                drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/30"
              )}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
                <UploadIcon className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold">Drop your Excel here</h3>
              <p className="text-sm text-muted-foreground mt-1">or click to browse · .xlsx, .xls, .csv up to 25MB</p>
            </label>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card rounded-xl p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
            <p className="font-medium">Reading headers from {file?.name}…</p>
            <p className="text-sm text-muted-foreground mt-1">Auto-detecting columns</p>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{file?.name}</span>
                  <Badge variant="outline" className="text-[10px]">{headers.length} columns</Badge>
                </div>
                <button onClick={reset} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary">
                <Sparkles className="h-3 w-3" />
                AI auto-suggested {Object.keys(mapping).length} of {headers.length} mappings
              </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
              <div className="grid grid-cols-2 border-b border-border bg-secondary/30">
                <div className="p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Your Excel Header</div>
                <div className="p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium border-l border-border">Map to System Field</div>
              </div>
              <div className="divide-y divide-border">
                {headers.map((h) => {
                  const value = mapping[h];
                  const isAuto = !!value;
                  return (
                    <div key={h} className="grid grid-cols-2 items-center hover:bg-secondary/20 transition-colors">
                      <div className="p-4 flex items-center gap-2">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">{h}</span>
                        {isAuto && (
                          <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                            <Sparkles className="h-2.5 w-2.5 mr-1" /> Auto
                          </Badge>
                        )}
                      </div>
                      <div className="p-3 border-l border-border">
                        <Select
                          value={value || "_none"}
                          onValueChange={(v) => setMapping((m) => ({ ...m, [h]: v === "_none" ? "" : v }))}
                        >
                          <SelectTrigger className="bg-secondary/50">
                            <SelectValue placeholder="Select field..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none">— Don't import —</SelectItem>
                            {SYSTEM_FIELDS.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label} {f.required && <span className="text-destructive">*</span>}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {missingRequired.length > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                Required fields not mapped: {missingRequired.join(", ")}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={reset}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Start over
              </Button>
              <Button onClick={() => setStep(4)} className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4">Review mapping</h3>
              <div className="space-y-2">
                {Object.entries(mapping).filter(([, v]) => v).map(([h, v]) => {
                  const sf = SYSTEM_FIELDS.find((f) => f.value === v);
                  return (
                    <div key={h} className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-2.5 text-sm">
                      <span className="text-muted-foreground">{h}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-primary mx-3" />
                      <span className="font-medium flex-1 text-right">{sf?.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Checkbox id="save" checked={saveMapping} onCheckedChange={(v) => setSaveMapping(!!v)} />
                <label htmlFor="save" className="text-sm cursor-pointer">Save this mapping for future uploads</label>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Edit mapping
              </Button>
              <Button onClick={confirm} className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                Confirm & Import <CheckCircle2 className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-12 text-center">
            {progress < 100 ? (
              <>
                <h3 className="font-display font-semibold mb-2">Processing students…</h3>
                <p className="text-sm text-muted-foreground mb-6">Importing rows from {file?.name}</p>
                <Progress value={progress} className="h-2 max-w-md mx-auto" />
                <p className="text-xs text-muted-foreground mt-3">{Math.round(progress * 1.56)} of 156 rows</p>
              </>
            ) : (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="mx-auto h-16 w-16 rounded-2xl bg-success/15 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-display font-semibold">Import complete</h3>
                <p className="text-sm text-muted-foreground mt-1">156 students imported successfully</p>
                <Button onClick={reset} className="mt-6 bg-gradient-primary text-primary-foreground hover:opacity-90">
                  Upload another file
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Upload;
