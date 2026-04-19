import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, SlidersHorizontal, Trophy, Users, ListChecks, ChevronDown, ChevronUp } from "lucide-react";
import { PlacementAPI, FacultyAPI } from "@/api";
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
  const [branch, setBranch] = useState("All Branches");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"readiness" | "cgpa">("readiness");

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
      .sort((a, b) => sortBy === "readiness" ? b.readiness - a.readiness : b.cgpa - a.cgpa);
  }, [students, search, sortBy]);

  const exportXls = () => {
    const rows = filtered.map((s, i) => ({
      Rank: i + 1, Name: s.name, Roll: s.roll, Email: s.email,
      Branch: s.branch, CGPA: s.cgpa, Readiness: s.readiness,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shortlist");
    XLSX.writeFile(wb, `shortlist-cgpa${minCgpa}-readiness${minReadiness}.xlsx`);
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
      subtitle="Filter and rank the entire student pool for any requirement."
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
            Filters
            <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">{filtered.length} matched</Badge>
          </div>
          {filtersOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {filtersOpen && (
          <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 border-t border-border/50">
            {/* Min CGPA */}
            <div>
              <Label className="text-xs text-muted-foreground">Min CGPA — <span className="text-foreground font-semibold">{minCgpa.toFixed(1)}</span></Label>
              <Slider
                min={0} max={10} step={0.1}
                value={[minCgpa]}
                onValueChange={([v]) => setMinCgpa(v)}
                className="mt-3"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>0.0</span><span>10.0</span></div>
            </div>
            {/* Min Readiness */}
            <div>
              <Label className="text-xs text-muted-foreground">Min Readiness — <span className="text-foreground font-semibold">{minReadiness}%</span></Label>
              <Slider
                min={0} max={100} step={5}
                value={[minReadiness]}
                onValueChange={([v]) => setMinReadiness(v)}
                className="mt-3"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>0%</span><span>100%</span></div>
            </div>
            {/* Branch */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Branch</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger className="h-9 bg-secondary/40 border-border/60 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Sort */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Sort By</Label>
              <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
                <SelectTrigger className="h-9 bg-secondary/40 border-border/60 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="readiness">Readiness Score</SelectItem>
                  <SelectItem value="cgpa">CGPA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-full flex justify-end">
              <Button onClick={fetchShortlist} disabled={loading} className="h-9 text-sm bg-gradient-primary text-primary-foreground hover:opacity-90">
                {loading ? "Filtering..." : "Apply Filters"}
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 text-primary p-2.5"><Users className="h-5 w-5" /></div>
          <div><p className="text-[10px] uppercase text-muted-foreground">Matched</p><p className="text-2xl font-display font-bold">{filtered.length}</p></div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="rounded-lg bg-success/10 text-success p-2.5"><ListChecks className="h-5 w-5" /></div>
          <div><p className="text-[10px] uppercase text-muted-foreground">Avg Readiness</p><p className="text-2xl font-display font-bold text-success">{filtered.length ? Math.round(filtered.reduce((a, s) => a + s.readiness, 0) / filtered.length) : 0}%</p></div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="rounded-lg bg-warning/10 text-warning p-2.5"><Trophy className="h-5 w-5" /></div>
          <div><p className="text-[10px] uppercase text-muted-foreground">Avg CGPA</p><p className="text-2xl font-display font-bold">{filtered.length ? (filtered.reduce((a, s) => a + s.cgpa, 0) / filtered.length).toFixed(2) : "—"}</p></div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or roll no..."
          className="max-w-sm h-9 bg-muted/40 border-border/60 text-sm"
        />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3 font-medium w-10">#</th>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Roll</th>
              <th className="p-3 font-medium hidden md:table-cell">Branch</th>
              <th className="p-3 font-medium">CGPA</th>
              <th className="p-3 font-medium">Readiness</th>
              <th className="p-3 font-medium hidden lg:table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-10 text-center text-muted-foreground animate-pulse">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No students match the current filters.</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} className="border-t border-border/50 hover:bg-secondary/20 transition-colors">
                <td className="p-3 font-mono text-xs text-muted-foreground">{i + 1}</td>
                <td className="p-3">
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.email}</p>
                </td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{s.roll}</td>
                <td className="p-3 hidden md:table-cell"><Badge variant="outline" className="text-[10px]">{s.branch}</Badge></td>
                <td className="p-3 font-display font-semibold">{s.cgpa?.toFixed(2)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-display font-semibold text-sm", s.readiness >= 80 ? "text-success" : s.readiness >= 60 ? "text-warning" : "text-destructive")}>
                      {Math.round(s.readiness)}%
                    </span>
                  </div>
                </td>
                <td className="p-3 hidden lg:table-cell">
                  <Badge className={cn("text-[10px]", statusColor(s.placementStatus))}>{s.placementStatus}</Badge>
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
