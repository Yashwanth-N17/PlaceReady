import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Clock, Users as UsersIcon, Send } from "lucide-react";
import { FacultyAPI } from "@/api";
import type { FacultyMember, StudentRecord } from "@/data/mock";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ScheduleTests = () => {
  const [me, setMe] = useState<FacultyMember | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState(30);
  const [type, setType] = useState("Aptitude");
  const [scope, setScope] = useState<"all" | "mentees" | "select">("mentees");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    FacultyAPI.me().then((m) => { setMe(m); setSubject(m.subjects[0] || ""); });
    FacultyAPI.students().then(setStudents);
  }, []);

  const visible = scope === "select" ? students : me ? students.filter((s) => me.menteeIds.includes(s.id)) : [];

  const submit = async () => {
    if (!title || !date || !subject) { toast.error("Fill in title, subject, date"); return; }
    const targetIds = scope === "all" ? students.map((s) => s.id) : scope === "mentees" ? (me?.menteeIds ?? []) : [...selected];
    await FacultyAPI.scheduleTest({
      title,
      subject,
      type,
      date: `${date}T${time}:00`,
      durationMin: duration,
      questionsCount: questions,
      status: "upcoming",
    });
    toast.success(`Test scheduled for ${targetIds.length} students`, { description: "Students will see it on their dashboard." });
    setTitle(""); setDate(""); setSelected(new Set()); setInstructions("");
  };

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <DashboardLayout role="faculty" title="Schedule a test" subtitle="Create a new mock — it appears on student dashboards instantly.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass-card rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Test title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. TCS NQT Mock 2" className="bg-secondary/50 mt-1" />
            </div>
            <div>
              <Label>Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="bg-secondary/50 mt-1"><SelectValue placeholder="Pick subject" /></SelectTrigger>
                <SelectContent>
                  {(me?.subjects ?? []).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-secondary/50 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Aptitude", "Coding", "Core CS", "Soft Skills"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-secondary/50 mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Clock className="h-3 w-3" />Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-secondary/50 mt-1" />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} className="bg-secondary/50 mt-1" />
            </div>
            <div>
              <Label>Number of questions</Label>
              <Input type="number" value={questions} onChange={(e) => setQuestions(+e.target.value)} className="bg-secondary/50 mt-1" />
            </div>
          </div>

          <div>
            <Label>Instructions (optional)</Label>
            <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className="bg-secondary/50 mt-1" rows={3} placeholder="Any special instructions for students..." />
          </div>

          <Button onClick={submit} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
            <Send className="h-4 w-4 mr-2" /> Schedule test
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
          <Label className="flex items-center gap-1"><UsersIcon className="h-3 w-3" /> Audience</Label>
          <Select value={scope} onValueChange={(v) => setScope(v as any)}>
            <SelectTrigger className="bg-secondary/50 mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mentees">My mentees ({me?.menteeIds.length ?? 0})</SelectItem>
              <SelectItem value="all">Entire batch</SelectItem>
              <SelectItem value="select">Select students</SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-4 max-h-[400px] overflow-y-auto space-y-1.5 pr-2">
            {visible.map((s) => (
              <label key={s.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/40 cursor-pointer">
                {scope === "select" && (
                  <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.roll} · {s.batch}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{s.readiness}%</Badge>
              </label>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            {scope === "select" ? `${selected.size} selected` : `${visible.length} students will be enrolled`}
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ScheduleTests;
