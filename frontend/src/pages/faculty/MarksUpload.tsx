import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle2, ArrowRight, Sparkles, Save } from "lucide-react";
import { FacultyAPI } from "@/api";
import type { StudentRecord } from "@/data/mock";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SYSTEM_FIELDS = [
  { value: "name", label: "Student Name", required: true },
  { value: "roll", label: "Roll Number", required: true },
  { value: "marks", label: "Marks / Score" },
  { value: "cgpa", label: "CGPA" },
  { value: "subject", label: "Subject" },
  { value: "remarks", label: "Remarks" },
] as const;

const guess = (header: string): string | undefined => {
  const h = header.toLowerCase().replace(/[^a-z]/g, "");
  if (h.includes("name") && !h.includes("user")) return "name";
  if (h.includes("roll") || h === "regno" || h === "studentid") return "roll";
  if (h.includes("mark") || h.includes("score")) return "marks";
  if (h.includes("cgpa") || h.includes("gpa")) return "cgpa";
  if (h.includes("subject")) return "subject";
  if (h.includes("remark") || h.includes("note")) return "remarks";
  return undefined;
};

const SAVED_KEY = "pr_marks_mapping";

const MarksUpload = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [tab, setTab] = useState<"manual" | "excel">("manual");
  const [subject, setSubject] = useState("DSA");
  const [examType, setExamType] = useState("Mid-sem");
  const [manualMarks, setManualMarks] = useState<Record<string, string>>({});
  const [manualCgpa, setManualCgpa] = useState<Record<string, string>>({});

  // Excel state
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [savedMap, setSavedMap] = useState<Record<string, string> | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saveMapping, setSaveMapping] = useState(true);

  useEffect(() => {
    FacultyAPI.students().then(setStudents);
    const s = localStorage.getItem(SAVED_KEY);
    if (s) setSavedMap(JSON.parse(s));
  }, []);

  const submitManual = async () => {
    const payload = students
      .filter((s) => manualMarks[s.id] || manualCgpa[s.id])
      .map((s) => ({
        studentId: s.id, name: s.name, roll: s.roll, subject, examType,
        marks: manualMarks[s.id] ? Number(manualMarks[s.id]) : undefined,
        cgpa: manualCgpa[s.id] ? Number(manualCgpa[s.id]) : undefined,
      }));
    if (!payload.length) { toast.error("Enter at least one mark"); return; }
    await FacultyAPI.uploadMarks(payload);
    toast.success(`${payload.length} marks saved for ${subject} (${examType})`);
    setManualMarks({}); setManualCgpa({});
  };

  const handleFile = async (f: File) => {
    setFile(f);
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
    if (!json.length) { toast.error("Empty file"); return; }
    const cols = Object.keys(json[0]);
    setHeaders(cols);
    setRows(json);
    const m: Record<string, string> = {};
    cols.forEach((c) => {
      if (savedMap?.[c]) m[c] = savedMap[c];
      else { const g = guess(c); if (g) m[c] = g; }
    });
    setMapping(m);
    setStep(2);
  };

  const required = SYSTEM_FIELDS.filter((f) => f.required).map((f) => f.value);
  const missingRequired = required.filter((r) => !Object.values(mapping).includes(r));

  const importExcel = async () => {
    if (missingRequired.length) { toast.error("Map required fields"); return; }
    const transformed = rows.map((r) => {
      const out: Record<string, unknown> = { subject, examType };
      Object.entries(mapping).forEach(([h, sysField]) => {
        if (sysField) out[sysField] = r[h];
      });
      return out;
    });
    if (saveMapping) {
      localStorage.setItem(SAVED_KEY, JSON.stringify(mapping));
      setSavedMap(mapping);
    }
    await FacultyAPI.uploadMarks(transformed);
    setStep(3);
    toast.success(`${transformed.length} rows imported`);
  };

  const reset = () => { setFile(null); setHeaders([]); setRows([]); setMapping({}); setStep(1); };

  return (
    <DashboardLayout role="faculty" title="Upload marks" subtitle="Manual entry or Excel import with smart column mapping.">
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="manual">Manual entry</TabsTrigger>
          <TabsTrigger value="excel">Excel import</TabsTrigger>
        </TabsList>

        {/* MANUAL */}
        <TabsContent value="manual" className="space-y-4">
          <div className="glass-card rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-secondary/50 mt-1" />
              </div>
              <div>
                <Label>Exam type</Label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger className="bg-secondary/50 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Mid-sem", "End-sem", "Quiz", "Assignment", "Practical"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="p-3 font-medium">Student</th>
                    <th className="p-3 font-medium">Roll</th>
                    <th className="p-3 font-medium w-32">Marks</th>
                    <th className="p-3 font-medium w-32">CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-t border-border/50">
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3 text-muted-foreground">{s.roll}</td>
                      <td className="p-2">
                        <Input
                          type="number" placeholder="—"
                          value={manualMarks[s.id] ?? ""}
                          onChange={(e) => setManualMarks((m) => ({ ...m, [s.id]: e.target.value }))}
                          className="h-8 bg-secondary/40"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number" step="0.01" placeholder={String(s.cgpa)}
                          value={manualCgpa[s.id] ?? ""}
                          onChange={(e) => setManualCgpa((m) => ({ ...m, [s.id]: e.target.value }))}
                          className="h-8 bg-secondary/40"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={submitManual} className="mt-4 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
              <Save className="h-4 w-4 mr-2" /> Save marks
            </Button>
          </div>
        </TabsContent>

        {/* EXCEL */}
        <TabsContent value="excel" className="space-y-4">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="up" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Subject</Label>
                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-secondary/50 mt-1" />
                  </div>
                  <div>
                    <Label>Exam type</Label>
                    <Input value={examType} onChange={(e) => setExamType(e.target.value)} className="bg-secondary/50 mt-1" />
                  </div>
                </div>
                <label className="block border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-12 text-center cursor-pointer transition-colors">
                  <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-3">
                    <UploadIcon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <p className="font-semibold">Drop your marks Excel</p>
                  <p className="text-xs text-muted-foreground mt-1">.xlsx · .xls · .csv</p>
                  {savedMap && (
                    <Badge className="mt-3 bg-primary/15 text-primary border-primary/30">
                      <Sparkles className="h-3 w-3 mr-1" /> Saved mapping will be reused
                    </Badge>
                  )}
                </label>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="map" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="glass-card rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                    <span className="font-medium">{file?.name}</span>
                    <Badge variant="outline" className="text-[10px]">{rows.length} rows</Badge>
                    <Badge variant="outline" className="text-[10px]">{headers.length} columns</Badge>
                  </div>
                  <Button size="sm" variant="ghost" onClick={reset}>Change file</Button>
                </div>

                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="grid grid-cols-2 border-b border-border bg-secondary/30">
                    <div className="p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Excel header</div>
                    <div className="p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium border-l border-border">Map to</div>
                  </div>
                  <div className="divide-y divide-border">
                    {headers.map((h) => {
                      const auto = !!mapping[h];
                      return (
                        <div key={h} className="grid grid-cols-2">
                          <div className="p-3 flex items-center gap-2">
                            <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">{h}</span>
                            {auto && <Badge variant="outline" className="text-[10px] text-primary border-primary/30"><Sparkles className="h-2.5 w-2.5 mr-1" />Auto</Badge>}
                          </div>
                          <div className="p-2 border-l border-border">
                            <Select value={mapping[h] || "_none"} onValueChange={(v) => setMapping((m) => ({ ...m, [h]: v === "_none" ? "" : v }))}>
                              <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
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

                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={saveMapping} onCheckedChange={(v) => setSaveMapping(!!v)} />
                    Save this mapping for next time
                  </label>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={reset}>Start over</Button>
                    <Button onClick={importExcel} className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                      Import {rows.length} rows <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-xl p-12 text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-success/15 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-7 w-7 text-success" />
                </div>
                <p className="font-display font-semibold text-xl">Marks imported successfully</p>
                <p className="text-sm text-muted-foreground mt-1">{rows.length} rows · {subject} · {examType}</p>
                <Button onClick={reset} className={cn("mt-5 bg-gradient-primary text-primary-foreground hover:opacity-90")}>
                  Upload another file
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default MarksUpload;
