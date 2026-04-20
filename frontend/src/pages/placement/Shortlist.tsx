import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
  Download, SlidersHorizontal, Trophy, Users, ListChecks, 
  ChevronDown, ChevronUp, ShieldCheck, Zap, User, ExternalLink 
} from "lucide-react";
import { PlacementAPI } from "@/api";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BRANCHES = ["All Branches", "Computer Science", "Information Science", "Electronics", "Mechanical"];

const Shortlist = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [minCgpa, setMinCgpa] = useState(7.0);
  const [minReadiness, setMinReadiness] = useState(50);
  const [minDiscipline, setMinDiscipline] = useState(60);
  const [branch, setBranch] = useState("All Branches");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"readiness" | "cgpa" | "discipline">("readiness");

  const fetchShortlist = async () => {
    setLoading(true);
    const filters: any = { minCgpa, minReadiness };
    if (branch !== "All Branches") filters.branch = branch;
    const data = await PlacementAPI.shortlist(filters);
    setStudents(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchShortlist(); }, []);

  const filtered = useMemo(() => {
    return students
      .filter(s =>
        (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.roll || "").toLowerCase().includes(search.toLowerCase())
      )
      .filter(s => (s.disciplineScore || 100) >= minDiscipline)
      .sort((a, b) => {
        if (sortBy === "readiness") return b.readiness - a.readiness;
        if (sortBy === "cgpa") return b.cgpa - a.cgpa;
        return (b.disciplineScore || 100) - (a.disciplineScore || 100);
      });
  }, [students, search, sortBy, minDiscipline]);

  const exportXls = () => {
    const rows = filtered.map((s, i) => ({
      Rank: i + 1, Name: s.name, Roll: s.roll, Email: s.email,
      Branch: s.branch, CGPA: s.cgpa, Readiness: s.readiness,
      DisciplineScore: s.disciplineScore || 100,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shortlist");
    XLSX.writeFile(wb, `shortlist-export-${Date.now()}.xlsx`);
    toast.success(`Exported ${rows.length} students`);
  };

  const statusColor = (status: string) => {
    const m: Record<string, string> = {
      PLACED: "bg-success/15 text-success border-success/30",
      APPLIED: "bg-info/15 text-info border-info/30",
      SHORTLISTED: "bg-primary/15 text-primary border-primary/30",
      OFFERED: "bg-success/15 text-success border-success/30",
      UNPLACED: "bg-secondary/40 text-muted-foreground",
    };
    return m[status] || m.UNPLACED;
  };

  return (
    <DashboardLayout
      role="placement"
      title="Smart Shortlisting"
      subtitle="Filter, benchmark, and rank students using combined technical and behavioral data."
      actions={
        <Button onClick={exportXls} disabled={!filtered.length} className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
          <Download className="h-4 w-4 mr-2" /> Export Excel
        </Button>
      }
    >
      {/* Filters Panel */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl mb-5 overflow-hidden">
        <button
          onClick={() => setFiltersOpen(f => !f)}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-2 font-semibold text-sm">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filters & Benchmarking
            <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">{filtered.length} matched</Badge>
          </div>
          {filtersOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {filtersOpen && (
          <div className="p-4 pt-0 space-y-6 border-t border-border/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
              {/* Min CGPA */}
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Trophy className="h-3 w-3" /> Min CGPA: <span className="text-foreground font-bold">{minCgpa.toFixed(1)}</span>
                </Label>
                <Slider min={0} max={10} step={0.1} value={[minCgpa]} onValueChange={([v]) => setMinCgpa(v)} />
              </div>

              {/* Min Readiness */}
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Zap className="h-3 w-3" /> Min Readiness: <span className="text-foreground font-bold">{minReadiness}%</span>
                </Label>
                <Slider min={0} max={100} step={5} value={[minReadiness]} onValueChange={([v]) => setMinReadiness(v)} />
              </div>

              {/* Min Discipline */}
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="h-3 w-3" /> Professional Discipline: <span className="text-foreground font-bold">{minDiscipline}%</span>
                </Label>
                <Slider min={0} max={100} step={5} value={[minDiscipline]} onValueChange={([v]) => setMinDiscipline(v)} />
              </div>

              {/* Branch */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block font-medium">Branch filter</Label>
                <Select value={branch} onValueChange={setBranch}>
                  <SelectTrigger className="h-9 bg-secondary/40 border-border/60 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Primary Sort</Label>
                  <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
                    <SelectTrigger className="h-8 w-40 bg-secondary/40 border-border/60 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="readiness">AI Readiness Score</SelectItem>
                      <SelectItem value="cgpa">Academic CGPA</SelectItem>
                      <SelectItem value="discipline">Professional Discipline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={fetchShortlist} disabled={loading} size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 px-8">
                {loading ? "Re-syncing pool..." : "Apply & Refresh"}
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
           {/* Search & Bulk View */}
          <div className="flex items-center justify-between">
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by name, USN, or email..."
              className="max-w-xs h-10 bg-muted/20 border-border/60"
            />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              Showing <span className="text-foreground font-bold">{filtered.length}</span> students
            </p>
          </div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden border border-border/50">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border/50">
                <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                  <th className="p-4 w-12 text-center opacity-50">Rank</th>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Academic</th>
                  <th className="p-4">Technical</th>
                  <th className="p-4">Behavioral</th>
                  <th className="p-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr><td colSpan={6} className="p-20 text-center text-muted-foreground animate-pulse">Synchronizing student pool...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center text-muted-foreground flex flex-col items-center gap-3">
                    <Users className="h-10 w-10 opacity-10" />
                    <p>No candidates match your current benchark requirements.</p>
                  </td></tr>
                ) : filtered.map((s, i) => (
                  <tr key={s.id} className="group hover:bg-primary/[0.03] transition-all">
                    <td className="p-4 text-center">
                      <span className={cn("inline-flex items-center justify-center h-7 w-7 rounded-lg text-[11px] font-bold", 
                        i < 3 ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"
                      )}>{i + 1}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 border border-border/50">
                          {s.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{s.roll} · {s.branch}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-display font-bold text-base">{s.cgpa?.toFixed(2)}</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">CGPA</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-base font-display font-bold", s.readiness >= 80 ? "text-primary" : "text-warning")}>
                          {Math.round(s.readiness)}%
                        </span>
                        <div className="h-4 w-1 bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all", s.readiness >= 80 ? "bg-primary" : "bg-warning")} style={{ height: `${s.readiness}%` }} />
                        </div>
                      </div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">AI Readiness</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-base font-display font-bold", (s.disciplineScore || 100) >= 80 ? "text-success" : "text-warning")}>
                          {Math.round(s.disciplineScore || 100)}%
                        </span>
                        <ShieldCheck className={cn("h-3.5 w-3.5", (s.disciplineScore || 100) >= 80 ? "text-success" : "text-warning")} />
                      </div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">Discipline</p>
                    </td>
                    <td className="p-4 text-right">
                       <Link to={`/placement/students/${s.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
           <div className="glass-card p-6 rounded-2xl border border-primary/20 bg-primary/5">
              <h4 className="font-display font-bold mb-4 flex items-center gap-2 text-primary uppercase tracking-widest text-[11px]">
                  <Zap className="h-4 w-4" /> Pool Intelligence
              </h4>
              <div className="space-y-4">
                 <div className="p-3 bg-background/50 rounded-xl border border-border/40">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">Top Tier Candidates</p>
                    <p className="text-2xl font-display font-bold">{filtered.filter(s => s.readiness >= 85).length}</p>
                 </div>
                 <div className="p-3 bg-background/50 rounded-xl border border-border/40">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">Avg Discipline</p>
                    <p className="text-2xl font-display font-bold text-success">
                        {filtered.length ? Math.round(filtered.reduce((a, s) => a + (s.disciplineScore || 100), 0) / filtered.length) : 100}%
                    </p>
                 </div>
                 <Button className="w-full bg-primary text-primary-foreground font-bold h-11 shadow-glow" onClick={exportXls}>
                    Generate Detailed Report
                 </Button>
              </div>
           </div>

           <div className="glass-card p-6 rounded-2xl border border-border/50">
              <h4 className="font-display font-bold mb-4 uppercase tracking-widest text-[11px]">Recent Status</h4>
              <div className="space-y-3">
                 {["PLACED", "OFFERED", "SHORTLISTED"].map(status => (
                   <div key={status} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <Badge className={cn("text-[9px] font-bold px-1.5", statusColor(status))}>{status}</Badge>
                      <span className="text-xs font-bold">{students.filter(s => s.placementStatus === status).length}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Shortlist;
