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
import { Plus, CalendarDays, MapPin, Users, Briefcase, UserCheck } from "lucide-react";
import { PlacementAPI, FacultyAPI } from "@/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_CLASS = {
  APPLIED: "bg-info/15 text-info border-info/30",
  SHORTLISTED: "bg-primary/15 text-primary border-primary/30",
  INTERVIEWED: "bg-warning/15 text-warning border-warning/30",
  OFFERED: "bg-success/15 text-success border-success/30",
  REJECTED: "bg-destructive/15 text-destructive border-destructive/30",
} as const;

const Drives = () => {
  const [drives, setDrives] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    companyId: "", date: "", venue: "", title: "", role: "", salary: ""
  });
  
  const [activeDrive, setActiveDrive] = useState<any | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    fetchDrives();
    PlacementAPI.companies().then((c) => { 
      setCompanies(c); 
      if (c[0]) setForm((f) => ({ ...f, companyId: c[0].id })); 
    });
  }, []);

  const fetchDrives = () => PlacementAPI.drives().then(setDrives);

  const fetchApplicants = async (driveId: string) => {
    setLoadingApplicants(true);
    try {
      const res = await PlacementAPI.driveApplicants(driveId);
      setApplicants(res.applicants || []);
    } catch (err) {
      toast.error("Failed to load applicants");
    } finally {
      setLoadingApplicants(false);
    }
  };

  const create = async () => {
    if (!form.companyId || !form.date || !form.role) { toast.error("Fill required fields"); return; }
    try {
      await PlacementAPI.createDrive(form);
      toast.success("Drive scheduled");
      setOpen(false);
      fetchDrives();
    } catch (err) {
      toast.error("Failed to create drive");
    }
  };

  const updateStatus = async (driveId: string, studentId: string, status: string) => {
    try {
      await PlacementAPI.updateApplicantStatus(driveId, studentId, status);
      setApplicants(prev => prev.map(a => a.id === studentId ? { ...a, placementStatus: status } : a));
      toast.success(`Updated status to ${status}`);
      fetchDrives(); // Update main counts
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  return (
    <DashboardLayout
      role="placement"
      title="Placement Drives"
      subtitle="Schedule drives, track applicants, manage outcomes."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
              <Plus className="h-4 w-4 mr-2" /> New drive
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Drive</DialogTitle>
              <DialogDescription>Students will see this in their active drives list.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <Label className="text-xs">Company</Label>
                <Select value={form.companyId} onValueChange={(v) => setForm({ ...form, companyId: v })}>
                  <SelectTrigger className="bg-secondary/40 mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Title (Optional)</Label><Input value={form.title} placeholder="e.g. Hiring 2025" onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary/40 mt-1 h-9 px-3" /></div>
              <div><Label className="text-xs">Job Role</Label><Input value={form.role} placeholder="SDE-1" onChange={(e) => setForm({ ...form, role: e.target.value })} className="bg-secondary/40 mt-1 h-9 px-3" /></div>
              <div><Label className="text-xs">Salary / CTC</Label><Input value={form.salary} placeholder="12 LPA" onChange={(e) => setForm({ ...form, salary: e.target.value })} className="bg-secondary/40 mt-1 h-9 px-3" /></div>
              <div><Label className="text-xs">Date</Label><Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-secondary/40 mt-1 h-9 px-3" /></div>
              <div className="col-span-2"><Label className="text-xs">Venue</Label><Input value={form.venue} placeholder="Seminar Hall 2" onChange={(e) => setForm({ ...form, venue: e.target.value })} className="bg-secondary/40 mt-1 h-9 px-3" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} className="bg-gradient-primary text-primary-foreground">Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {drives.map((d, i) => {
          const co = d.company;
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { setActiveDrive(d); fetchApplicants(d.id); }}
              className="group text-left glass-card rounded-xl p-5 hover:shadow-elevated transition-all cursor-pointer border border-border/50 hover:border-primary/40"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-bold text-primary-foreground shadow-glow">
                    {co?.name?.[0] || "D"}
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm leading-tight">{co?.name || "Company"}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{d.role || "Role"} · {d.salary || "CTC"}</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-[9px] h-5", d.status === "UPCOMING" ? "text-warning" : d.status === "ACTIVE" ? "text-success" : "text-muted-foreground")}>
                  {d.status?.toLowerCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px] text-muted-foreground mb-4">
                <div className="flex items-center gap-1.5"><CalendarDays className="h-3 w-3" />{new Date(d.date).toLocaleDateString()}</div>
                <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{d.location || d.venue || "—"}</div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <span className="text-success font-bold text-xs">{d.offersCount || 0}</span>
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Offers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-bold text-xs">{d.applicantCount || 0}</span>
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Applicants</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!activeDrive} onOpenChange={(o) => !o && setActiveDrive(null)}>
        <DialogContent className="max-w-2xl">
          {activeDrive && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Briefcase className="h-5 w-5" /></div>
                  <div>
                    <DialogTitle>{activeDrive.company?.name} · {activeDrive.role}</DialogTitle>
                    <DialogDescription>{new Date(activeDrive.date).toLocaleString()} · {activeDrive.venue}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="max-h-[400px] overflow-y-auto rounded-xl border border-border/60">
                {loadingApplicants ? (
                  <div className="p-10 text-center text-muted-foreground animate-pulse">Loading applicants...</div>
                ) : applicants.length === 0 ? (
                  <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 opacity-20" />
                    <p className="text-sm font-medium">No one has applied yet</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-secondary/90 backdrop-blur border-b border-border/60">
                      <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                        <th className="p-3 font-semibold">Student</th>
                        <th className="p-3 font-semibold">Roll</th>
                        <th className="p-3 font-semibold text-center">Metric</th>
                        <th className="p-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map((a) => (
                        <tr key={a.id} className="border-t border-border/50 group hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <p className="font-medium text-foreground">{a.name}</p>
                            <p className="text-[10px] text-muted-foreground">{a.email}</p>
                          </td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">{a.roll}</td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-foreground font-bold">{a.cgpa}</span>
                              <span className="text-[9px] text-muted-foreground uppercase">CGPA</span>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <Select 
                              value={a.placementStatus} 
                              onValueChange={(v) => updateStatus(activeDrive.id, a.id, v)}
                            >
                              <SelectTrigger className={cn("h-7 w-32 ml-auto text-[10px] font-semibold", STATUS_CLASS[a.placementStatus as keyof typeof STATUS_CLASS])}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(STATUS_CLASS).map((k) => (
                                  <SelectItem key={k} value={k} className="text-xs font-semibold">{k.replace("_", " ")}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Drives;
