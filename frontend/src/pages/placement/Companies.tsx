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
import { Building2, Plus, Briefcase } from "lucide-react";
import { PlacementAPI } from "@/api";
import type { Company } from "@/data/mock";
import { toast } from "sonner";

const BRANCHES = ["CSE", "ECE", "MECH", "EEE", "CIVIL"];

const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Company>>({
    name: "", role: "", ctc: "", minCgpa: 7.0, minReadiness: 70, minApt: 70, minCode: 70,
    branches: ["CSE"], requiredSkills: [],
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    PlacementAPI.companies().then(setCompanies);
  }, []);

  const create = async () => {
    if (!form.name || !form.role) { toast.error("Name and role are required"); return; }
    const created = await PlacementAPI.createCompany(form);
    const newCompany: Company = {
      id: (created as { id: string }).id ?? `co-${Date.now()}`,
      name: form.name!, role: form.role!, ctc: form.ctc || "—",
      minCgpa: form.minCgpa ?? 0, minReadiness: form.minReadiness ?? 0,
      minApt: form.minApt ?? 0, minCode: form.minCode ?? 0,
      branches: form.branches ?? [], requiredSkills: form.requiredSkills ?? [],
    };
    setCompanies((cs) => [newCompany, ...cs]);
    setOpen(false);
    setForm({ name: "", role: "", ctc: "", minCgpa: 7, minReadiness: 70, minApt: 70, minCode: 70, branches: ["CSE"], requiredSkills: [] });
    toast.success(`${newCompany.name} added`);
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setForm((f) => ({ ...f, requiredSkills: [...(f.requiredSkills ?? []), skillInput.trim()] }));
    setSkillInput("");
  };

  return (
    <DashboardLayout
      role="placement"
      title="Companies"
      subtitle="Manage company profiles and eligibility criteria."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
              <Plus className="h-4 w-4 mr-2" /> Add company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add company</DialogTitle>
              <DialogDescription>Define eligibility — students will be auto-shortlisted.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary/50 mt-1" /></div>
                <div><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="bg-secondary/50 mt-1" /></div>
              </div>
              <div><Label>CTC</Label><Input value={form.ctc} onChange={(e) => setForm({ ...form, ctc: e.target.value })} placeholder="e.g. ₹12 LPA" className="bg-secondary/50 mt-1" /></div>
              <div className="grid grid-cols-4 gap-2">
                <div><Label className="text-[10px]">Min CGPA</Label><Input type="number" step="0.1" value={form.minCgpa} onChange={(e) => setForm({ ...form, minCgpa: +e.target.value })} className="bg-secondary/50 mt-1" /></div>
                <div><Label className="text-[10px]">Readiness</Label><Input type="number" value={form.minReadiness} onChange={(e) => setForm({ ...form, minReadiness: +e.target.value })} className="bg-secondary/50 mt-1" /></div>
                <div><Label className="text-[10px]">Aptitude</Label><Input type="number" value={form.minApt} onChange={(e) => setForm({ ...form, minApt: +e.target.value })} className="bg-secondary/50 mt-1" /></div>
                <div><Label className="text-[10px]">Coding</Label><Input type="number" value={form.minCode} onChange={(e) => setForm({ ...form, minCode: +e.target.value })} className="bg-secondary/50 mt-1" /></div>
              </div>
              <div>
                <Label>Branches</Label>
                <Select value={form.branches?.[0]} onValueChange={(v) => setForm({ ...form, branches: [v] })}>
                  <SelectTrigger className="bg-secondary/50 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Required skills</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="e.g. DSA" className="bg-secondary/50" />
                  <Button variant="outline" onClick={addSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.requiredSkills?.map((s) => (
                    <Badge key={s} variant="outline" className="cursor-pointer" onClick={() => setForm((f) => ({ ...f, requiredSkills: f.requiredSkills?.filter((x) => x !== s) }))}>
                      {s} ✕
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} className="bg-gradient-primary text-primary-foreground hover:opacity-90">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="glass-card rounded-xl p-5 hover:shadow-elevated transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground shadow-glow shrink-0">
                {(c.name || "?")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold truncate">{c.name || "Unnamed Company"}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Briefcase className="h-3 w-3" /> {c.role} · <span className="text-primary font-medium">{c.ctc}</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div className="rounded bg-secondary/40 px-2 py-1.5"><span className="text-muted-foreground">CGPA</span> <span className="font-semibold float-right">{c.minCgpa}+</span></div>
              <div className="rounded bg-secondary/40 px-2 py-1.5"><span className="text-muted-foreground">Readiness</span> <span className="font-semibold float-right">{c.minReadiness}+</span></div>
              <div className="rounded bg-secondary/40 px-2 py-1.5"><span className="text-muted-foreground">Aptitude</span> <span className="font-semibold float-right">{c.minApt}+</span></div>
              <div className="rounded bg-secondary/40 px-2 py-1.5"><span className="text-muted-foreground">Coding</span> <span className="font-semibold float-right">{c.minCode}+</span></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {(c.branches || []).map((b) => <Badge key={b} variant="outline" className="text-[10px]">{b}</Badge>)}
              {(c.requiredSkills || []).map((s) => <Badge key={s} className="text-[10px] bg-primary/15 text-primary border-primary/30">{s}</Badge>)}
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Companies;
