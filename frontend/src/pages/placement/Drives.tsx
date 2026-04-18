import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, CalendarDays, MapPin, Users } from "lucide-react";
import { PlacementAPI, FacultyAPI } from "@/api";
import type { Company, PlacementDrive, StudentRecord } from "@/data/mock";
import { toast } from "sonner";

const STATUS_CLASS = {
  applied: "bg-info/15 text-info border-info/30",
  shortlisted: "bg-primary/15 text-primary border-primary/30",
  interviewed: "bg-warning/15 text-warning border-warning/30",
  offered: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
} as const;

const Drives = () => {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ companyId: string; date: string; venue: string }>({
    companyId: "", date: "", venue: "Auditorium A",
  });
  const [activeDrive, setActiveDrive] = useState<PlacementDrive | null>(null);

  useEffect(() => {
    PlacementAPI.drives().then(setDrives);
    PlacementAPI.companies().then((c) => { setCompanies(c); if (c[0]) setForm((f) => ({ ...f, companyId: c[0].id })); });
    FacultyAPI.students().then(setStudents);
  }, []);

  const create = async () => {
    if (!form.companyId || !form.date) { toast.error("Pick company and date"); return; }
    const newDrive: PlacementDrive = {
      id: `dr-${Date.now()}`, companyId: form.companyId, date: form.date, venue: form.venue,
      status: "scheduled", applicantIds: [], applicantStatus: {},
    };
    await PlacementAPI.createDrive(newDrive);
    setDrives((d) => [newDrive, ...d]);
    setOpen(false);
    toast.success("Drive scheduled");
  };

  const updateStatus = async (driveId: string, studentId: string, status: keyof typeof STATUS_CLASS) => {
    setDrives((ds) =>
      ds.map((d) => d.id === driveId ? { ...d, applicantStatus: { ...d.applicantStatus, [studentId]: status } } : d),
    );
    await PlacementAPI.updateApplicantStatus(driveId, studentId, status);
  };

  return (
    <DashboardLayout
      role="placement"
      title="Drives"
      subtitle="Schedule drives, track applicants, manage outcomes."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
              <Plus className="h-4 w-4 mr-2" /> New drive
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule drive</DialogTitle>
              <DialogDescription>Add to the calendar — students will be notified.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Company</Label>
                <Select value={form.companyId} onValueChange={(v) => setForm({ ...form, companyId: v })}>
                  <SelectTrigger className="bg-secondary/50 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date & time</Label><Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-secondary/50 mt-1" /></div>
              <div><Label>Venue</Label><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="bg-secondary/50 mt-1" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} className="bg-gradient-primary text-primary-foreground hover:opacity-90">Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {drives.map((d, i) => {
          const co = companies.find((c) => c.id === d.companyId);
          const offers = Object.values(d.applicantStatus).filter((x) => x === "offered").length;
          return (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveDrive(d)}
              className="text-left glass-card rounded-xl p-5 hover:shadow-elevated transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center font-bold text-primary-foreground">
                    {co?.name[0]}
                  </div>
                  <div>
                    <p className="font-display font-semibold">{co?.name}</p>
                    <p className="text-xs text-muted-foreground">{co?.role} · {co?.ctc}</p>
                  </div>
                </div>
                <Badge className={`${
                  d.status === "completed" ? "bg-success/15 text-success border-success/30" :
                  d.status === "in_progress" ? "bg-info/15 text-info border-info/30" :
                  "bg-warning/15 text-warning border-warning/30"
                }`}>{d.status.replace("_", " ")}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                <div className="rounded bg-secondary/40 p-2"><CalendarDays className="h-3 w-3 text-muted-foreground inline mr-1" />{new Date(d.date).toLocaleDateString()}</div>
                <div className="rounded bg-secondary/40 p-2 truncate"><MapPin className="h-3 w-3 text-muted-foreground inline mr-1" />{d.venue}</div>
                <div className="rounded bg-secondary/40 p-2"><Users className="h-3 w-3 text-muted-foreground inline mr-1" />{d.applicantIds.length}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-3"><span className="text-success font-semibold">{offers}</span> offers · <span className="text-primary font-semibold">{Object.values(d.applicantStatus).filter((x) => x === "shortlisted").length}</span> shortlisted</p>
            </motion.button>
          );
        })}
      </div>

      <Dialog open={!!activeDrive} onOpenChange={(o) => !o && setActiveDrive(null)}>
        <DialogContent className="max-w-2xl">
          {activeDrive && (() => {
            const co = companies.find((c) => c.id === activeDrive.companyId);
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{co?.name} · {co?.role}</DialogTitle>
                  <DialogDescription>{new Date(activeDrive.date).toLocaleString()} · {activeDrive.venue}</DialogDescription>
                </DialogHeader>
                <div className="max-h-[400px] overflow-y-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
                      <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="p-2 font-medium">Student</th>
                        <th className="p-2 font-medium">Roll</th>
                        <th className="p-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeDrive.applicantIds.map((sid) => {
                        const s = students.find((x) => x.id === sid);
                        const status = activeDrive.applicantStatus[sid] ?? "applied";
                        return (
                          <tr key={sid} className="border-t border-border/50">
                            <td className="p-2 font-medium">{s?.name}</td>
                            <td className="p-2 text-muted-foreground">{s?.roll}</td>
                            <td className="p-2">
                              <Select value={status} onValueChange={(v) => updateStatus(activeDrive.id, sid, v as any)}>
                                <SelectTrigger className="h-7 w-36 text-xs bg-secondary/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Object.keys(STATUS_CLASS).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Drives;
