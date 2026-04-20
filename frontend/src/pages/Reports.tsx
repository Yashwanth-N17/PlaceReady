import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Role } from "@/components/RoleSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { Download, FileText, GitBranch, Building2, TrendingUp, Users } from "lucide-react";
import { ReportsAPI } from "@/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
};

const BRANCH_COLORS = ["#818cf8", "#34d399", "#f59e0b", "#f87171", "#38bdf8", "#a78bfa"];
const TIER_COLORS = { Product: "#818cf8", Service: "#34d399", Consulting: "#f59e0b", Startup: "#f87171" };

interface Props { role: Role }

const Reports = ({ role }: Props) => {
  const [monthly, setMonthly] = useState<any[]>([]);
  const [yoy, setYoy] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [branchData, setBranchData] = useState<any[]>([]);
  const [tierData, setTierData] = useState<any[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<Set<string>>(new Set());

  useEffect(() => {
    ReportsAPI.monthlyReadiness().then(setMonthly);
    ReportsAPI.yearOverYear().then(setYoy);
    ReportsAPI.skillHeatmap().then(setHeatmap);
    ReportsAPI.branchComparison().then(d => {
      setBranchData(d);
      setSelectedBranches(new Set(d.map((b: any) => b.branch)));
    });
    ReportsAPI.companyTiers().then(setTierData);
  }, []);

  const heatCells = useMemo(() => {
    const skills = ["DSA", "OS", "DBMS", "Aptitude", "Soft"] as const;
    return heatmap.map((row) => ({
      batch: row.batch,
      cells: skills.map((sk) => ({ skill: sk, value: (row as any)[sk] as number })),
    }));
  }, [heatmap]);

  const colorFor = (v: number) => {
    if (v >= 75) return "bg-success/40 text-success-foreground";
    if (v >= 65) return "bg-primary/40";
    if (v >= 55) return "bg-warning/30";
    return "bg-destructive/30";
  };

  const toggleBranch = (branch: string) => {
    setSelectedBranches(prev => {
      const next = new Set(prev);
      if (next.has(branch)) { if (next.size > 1) next.delete(branch); }
      else next.add(branch);
      return next;
    });
  };

  const filteredBranch = branchData.filter(b => selectedBranches.has(b.branch));

  // Radar data from selected branches
  const radarData = ["avgReadiness", "avgCgpa10", "avgScore", "disciplineProxy"].map(key => {
    const entry: any = { metric: key === "avgCgpa10" ? "CGPA×10" : key === "disciplineProxy" ? "Discipline" : key === "avgReadiness" ? "Readiness" : "Avg Score" };
    filteredBranch.forEach(b => {
      entry[b.branch] = key === "avgCgpa10" ? (b.avgCgpa * 10) : b[key === "disciplineProxy" ? "avgReadiness" : key];
    });
    return entry;
  });

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthly), "MonthlyReadiness");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(yoy), "YearOverYear");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(heatmap), "SkillHeatmap");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(branchData), "BranchAnalytics");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tierData), "CompanyTiers");
    XLSX.writeFile(wb, "placement-reports.xlsx");
    toast.success("Excel exported");
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("PlaceReady — Reports", 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22);
    autoTable(doc, { startY: 28, head: [["Month", "CSE-A", "CSE-B", "ECE"]], body: monthly.map((m) => [m.month, m.batchA, m.batchB, m.ece]), headStyles: { fillColor: [38, 175, 230] } });
    autoTable(doc, { startY: (doc as any).lastAutoTable.finalY + 10, head: [["Year", "Placement %", "Avg CTC (LPA)"]], body: yoy.map((y) => [y.year, y.placementRate, y.avgCtc]), headStyles: { fillColor: [38, 175, 230] } });
    autoTable(doc, { startY: (doc as any).lastAutoTable.finalY + 10, head: [["Branch", "Avg Readiness", "Avg CGPA", "Avg Score", "Students"]], body: branchData.map(b => [b.branch, b.avgReadiness, b.avgCgpa, b.avgScore, b.studentCount]), headStyles: { fillColor: [38, 175, 230] } });
    doc.save("placement-reports.pdf");
    toast.success("PDF exported");
  };

  return (
    <DashboardLayout
      role={role}
      title={role === "placement" ? "Analytics Reports" : "Reports & Trends"}
      subtitle={role === "placement" ? "Branch-wise analysis, company tiers, and detailed skill heatmaps." : "Trends, branch comparisons, company tier breakdowns, and exportable summaries."}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={exportPdf}><FileText className="h-4 w-4 mr-2" />PDF</Button>
          <Button size="sm" onClick={exportExcel} className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
            <Download className="h-4 w-4 mr-2" />Excel
          </Button>
        </>
      }
    >
      <Tabs defaultValue={role === "placement" ? "branch" : "overview"} className="w-full">
        <TabsList className="mb-6 bg-secondary/30 rounded-xl p-1 h-12 gap-1">
          {role !== "placement" && (
            <TabsTrigger value="overview" className="rounded-lg px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
          )}
          <TabsTrigger value="branch" className="rounded-lg px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <GitBranch className="h-4 w-4 mr-2" /> Branch Comparison
          </TabsTrigger>
          <TabsTrigger value="tiers" className="rounded-lg px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Building2 className="h-4 w-4 mr-2" /> Company Tiers
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Overview ── */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold mb-1">Readiness — month over month</h3>
              <p className="text-xs text-muted-foreground mb-4">By batch</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthly} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                    <Line type="monotone" dataKey="batchA" name="CSE-A" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="batchB" name="CSE-B" stroke="hsl(var(--primary-glow))" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="ece" name="ECE" stroke="hsl(var(--success))" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold mb-1">Year-over-year placements</h3>
              <p className="text-xs text-muted-foreground mb-4">Placement rate (%) and avg CTC (LPA)</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yoy} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--primary) / 0.06)" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                    <Bar dataKey="placementRate" name="Placement %" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="avgCtc" name="Avg CTC" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-xl p-6">
            <h3 className="font-display font-semibold mb-1">Batch × skill heatmap</h3>
            <p className="text-xs text-muted-foreground mb-4">Average score by batch and skill</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-1">
                <thead>
                  <tr>
                    <th></th>
                    {(heatCells[0]?.cells ?? []).map((c) => (
                      <th key={c.skill} className="p-2 text-xs uppercase tracking-wider text-muted-foreground font-medium text-center">{c.skill}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatCells.map((row) => (
                    <tr key={row.batch}>
                      <td className="p-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">{row.batch}</td>
                      {row.cells.map((c) => (
                        <td key={c.skill} className={cn("p-3 rounded text-center font-display font-semibold", colorFor(c.value))}>{c.value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── TAB 2: Branch Comparison ── */}
        <TabsContent value="branch" className="mt-0 space-y-6">
          {/* Branch filter chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mr-2 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Filter:</span>
            {branchData.map((b, i) => (
              <button
                key={b.branch}
                onClick={() => toggleBranch(b.branch)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold border transition-all",
                  selectedBranches.has(b.branch)
                    ? "text-white border-transparent shadow-sm"
                    : "bg-transparent border-border text-muted-foreground hover:border-primary/40"
                )}
                style={selectedBranches.has(b.branch) ? { backgroundColor: BRANCH_COLORS[i % BRANCH_COLORS.length] } : {}}
              >
                {b.branch}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar: multi-metric comparison */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold mb-1">Metric Comparison by Branch</h3>
              <p className="text-xs text-muted-foreground mb-4">Readiness, CGPA×10, and Avg Score side-by-side</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredBranch} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="branch" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--primary) / 0.05)" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                    <Bar dataKey="avgReadiness" name="Readiness" fill="#818cf8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgScore" name="Avg Score" fill="#34d399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Radar: shape comparison */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold mb-1">Radar Profile</h3>
              <p className="text-xs text-muted-foreground mb-4">Multi-dimensional branch comparison</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <PolarRadiusAxis stroke="hsl(var(--border))" fontSize={9} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    {filteredBranch.map((b, i) => (
                      <Radar
                        key={b.branch}
                        name={b.branch}
                        dataKey={b.branch}
                        stroke={BRANCH_COLORS[branchData.findIndex(x => x.branch === b.branch) % BRANCH_COLORS.length]}
                        fill={BRANCH_COLORS[branchData.findIndex(x => x.branch === b.branch) % BRANCH_COLORS.length]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Branch stats table */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border/40">
              <h3 className="font-display font-semibold">Branch Statistics</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Branch</th>
                    <th className="px-6 py-4 text-left font-bold">Students</th>
                    <th className="px-6 py-4 text-left font-bold">Avg Readiness</th>
                    <th className="px-6 py-4 text-left font-bold">Avg CGPA</th>
                    <th className="px-6 py-4 text-left font-bold">Avg Score</th>
                    <th className="px-6 py-4 text-left font-bold">Avg Focus Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {branchData.map((b, i) => (
                    <tr key={b.branch} className={cn("hover:bg-secondary/20 transition-colors", !selectedBranches.has(b.branch) && "opacity-40")}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BRANCH_COLORS[i % BRANCH_COLORS.length] }} />
                          <span className="font-bold">{b.branch}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">{b.studentCount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${b.avgReadiness}%` }} />
                          </div>
                          <span className="font-display font-bold text-primary">{b.avgReadiness}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold">{b.avgCgpa}</td>
                      <td className="px-6 py-4 font-semibold">{b.avgScore}%</td>
                      <td className="px-6 py-4">
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                          b.avgFocusLoss <= 1 ? "bg-success/10 text-success" :
                          b.avgFocusLoss <= 3 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                        )}>
                          {b.avgFocusLoss} avg
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── TAB 3: Company Tiers ── */}
        <TabsContent value="tiers" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tierData.map((t) => {
              const color = (TIER_COLORS as any)[t.tier] || "#818cf8";
              return (
                <motion.div key={t.tier} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5 border border-border/40 hover:border-primary/20 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{t.tier}</span>
                    <span className="text-[10px] text-muted-foreground">{t.companies} companies</span>
                  </div>
                  <div className="text-3xl font-display font-bold mb-1" style={{ color }}>{t.conversionRate}%</div>
                  <div className="text-xs text-muted-foreground mb-4">Offer conversion rate</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Drives</span><span className="font-semibold">{t.drives}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Applicants</span><span className="font-semibold">{t.applicants}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Offers</span><span className="font-semibold text-success">{t.offers}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Avg CGPA req.</span><span className="font-semibold">{t.avgCgpa}</span></div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold mb-1">Conversion Rate by Tier</h3>
              <p className="text-xs text-muted-foreground mb-4">Offers given as % of applicants</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tierData} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="tier" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--primary) / 0.05)" }} />
                    <Bar dataKey="conversionRate" name="Conversion %" radius={[6, 6, 0, 0]}>
                      {tierData.map((t, i) => (
                        <rect key={i} fill={(TIER_COLORS as any)[t.tier] || BRANCH_COLORS[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold mb-1">Applicant vs Offer Volume</h3>
              <p className="text-xs text-muted-foreground mb-4">Pipeline depth by company tier</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tierData} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="tier" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--primary) / 0.05)" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                    <Bar dataKey="applicants" name="Applicants" fill="#818cf8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="offers" name="Offers" fill="#34d399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Reports;
