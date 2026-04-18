import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, ListChecks, Trophy, Users } from "lucide-react";
import { PlacementAPI } from "@/api";
import type { Company, StudentRecord } from "@/data/mock";
import * as XLSX from "xlsx";
import { toast } from "sonner";

const Shortlist = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
  const [students, setStudents] = useState<StudentRecord[]>([]);

  useEffect(() => {
    PlacementAPI.companies().then((c) => { setCompanies(c); if (c[0]) setCompanyId(c[0].id); });
  }, []);

  useEffect(() => {
    if (!companyId) return;
    PlacementAPI.shortlist(companyId).then(setStudents);
  }, [companyId]);

  const company = companies.find((c) => c.id === companyId);

  const ranked = useMemo(() => {
    if (!company) return [];
    return students
      .map((s) => {
        const eligible =
          s.cgpa >= company.minCgpa &&
          s.readiness >= company.minReadiness &&
          s.aptitude >= company.minApt &&
          s.coding >= company.minCode &&
          company.branches.includes(s.branch);
        const score = (s.readiness * 0.4) + (s.aptitude * 0.25) + (s.coding * 0.25) + (s.cgpa * 10 * 0.1);
        return { ...s, eligible, rank: score };
      })
      .sort((a, b) => b.rank - a.rank);
  }, [students, company]);

  const eligible = ranked.filter((s) => s.eligible);

  const exportXls = () => {
    const rows = eligible.map((s, i) => ({
      Rank: i + 1, Name: s.name, Roll: s.roll, Email: s.email, Branch: s.branch, Batch: s.batch,
      CGPA: s.cgpa, Readiness: s.readiness, Aptitude: s.aptitude, Coding: s.coding,
      Score: Math.round(s.rank),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shortlist");
    XLSX.writeFile(wb, `${company?.name ?? "shortlist"}-shortlist.xlsx`);
    toast.success(`Exported ${rows.length} students`);
  };

  return (
    <DashboardLayout
      role="placement"
      title="Shortlisting"
      subtitle="Pick a company — we'll rank the eligible students automatically."
      actions={
        <Button onClick={exportXls} disabled={!eligible.length} className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
          <Download className="h-4 w-4 mr-2" /> Export Excel
        </Button>
      }
    >
      <div className="glass-card rounded-xl p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Company</p>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger className="bg-secondary/50 max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · {c.role}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {company && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">CGPA ≥ {company.minCgpa}</Badge>
              <Badge variant="outline">Readiness ≥ {company.minReadiness}</Badge>
              <Badge variant="outline">Apt ≥ {company.minApt}</Badge>
              <Badge variant="outline">Code ≥ {company.minCode}</Badge>
              {company.branches.map((b) => <Badge key={b} className="bg-primary/15 text-primary border-primary/30">{b}</Badge>)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 text-primary p-2.5"><Users className="h-5 w-5" /></div>
          <div><p className="text-[10px] uppercase text-muted-foreground">Pool</p><p className="text-2xl font-display font-bold">{ranked.length}</p></div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="rounded-lg bg-success/10 text-success p-2.5"><ListChecks className="h-5 w-5" /></div>
          <div><p className="text-[10px] uppercase text-muted-foreground">Eligible</p><p className="text-2xl font-display font-bold text-success">{eligible.length}</p></div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="rounded-lg bg-warning/10 text-warning p-2.5"><Trophy className="h-5 w-5" /></div>
          <div><p className="text-[10px] uppercase text-muted-foreground">Top score</p><p className="text-2xl font-display font-bold">{eligible[0] ? Math.round(eligible[0].rank) : "—"}</p></div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3 font-medium w-12">#</th>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Roll</th>
              <th className="p-3 font-medium">Branch</th>
              <th className="p-3 font-medium">CGPA</th>
              <th className="p-3 font-medium">Readiness</th>
              <th className="p-3 font-medium hidden md:table-cell">Apt</th>
              <th className="p-3 font-medium hidden md:table-cell">Code</th>
              <th className="p-3 font-medium">Score</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((s, i) => (
              <tr key={s.id} className={`border-t border-border/50 hover:bg-secondary/20 transition-colors ${!s.eligible && "opacity-50"}`}>
                <td className="p-3 font-mono text-muted-foreground">{i + 1}</td>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3 text-muted-foreground">{s.roll}</td>
                <td className="p-3"><Badge variant="outline" className="text-[10px]">{s.branch}</Badge></td>
                <td className="p-3">{s.cgpa}</td>
                <td className="p-3 font-display font-semibold">{s.readiness}%</td>
                <td className="p-3 hidden md:table-cell">{s.aptitude}</td>
                <td className="p-3 hidden md:table-cell">{s.coding}</td>
                <td className="p-3 font-display font-semibold text-primary">{Math.round(s.rank)}</td>
                <td className="p-3">
                  {s.eligible
                    ? <Badge className="bg-success/15 text-success border-success/30">Eligible</Badge>
                    : <Badge variant="outline" className="text-muted-foreground">Not eligible</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </DashboardLayout>
  );
};

export default Shortlist;
