import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Building2, Users, TrendingUp, Trophy, Download, ArrowUpRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { PlacementAPI } from "@/api";
import type { Company, PlacementDrive } from "@/data/mock";
import * as XLSX from "xlsx";
import { toast } from "sonner";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "var(--shadow-elevated)",
};

const PlacementDashboard = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [trends, setTrends] = useState<Awaited<ReturnType<typeof PlacementAPI.trends>>>([]);

  useEffect(() => {
    PlacementAPI.companies().then(setCompanies);
    PlacementAPI.drives().then(setDrives);
    PlacementAPI.trends().then(setTrends);
  }, []);

  const totalApplicants = drives.reduce((s, d) => s + d.applicantIds.length, 0);
  const offers = drives.reduce(
    (s, d) => s + Object.values(d.applicantStatus).filter((x) => x === "offered").length, 0,
  );
  const upcomingDrives = drives.filter((d) => d.status !== "completed").length;

  const exportSummary = () => {
    const rows = drives.map((d) => {
      const co = companies.find((c) => c.id === d.companyId);
      return {
        Drive: co?.name ?? d.companyId,
        Date: new Date(d.date).toLocaleDateString(),
        Status: d.status,
        Applicants: d.applicantIds.length,
        Offers: Object.values(d.applicantStatus).filter((x) => x === "offered").length,
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Drives");
    XLSX.writeFile(wb, "placement-summary.xlsx");
    toast.success("Exported placement summary");
  };

  return (
    <DashboardLayout
      role="placement"
      title="Placement Cell"
      subtitle="Pipeline, drives, shortlists — at a glance."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={exportSummary}><Download className="h-4 w-4 mr-2" />Export</Button>
          <Link to="/placement/companies">
            <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
              <Building2 className="h-4 w-4 mr-2" /> Add company
            </Button>
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Building2} label="Companies" value={companies.length} change="+3 this month" changeType="positive" delay={0} />
        <StatCard icon={CalendarDays} label="Upcoming drives" value={upcomingDrives} change={`${drives.length} total`} changeType="neutral" delay={0.1} />
        <StatCard icon={Users} label="Applicants" value={totalApplicants} change="across drives" delay={0.15} />
        <StatCard icon={Trophy} label="Offers made" value={offers} change="+11% YoY" changeType="positive" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }} className="glass-card rounded-xl p-6 lg:col-span-2"
        >
          <h3 className="font-display font-semibold mb-1">Placement trends</h3>
          <p className="text-xs text-muted-foreground mb-4">Offers over years</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                <Area type="monotone" dataKey="offers" name="Offers" stroke="hsl(var(--primary))" fill="url(#g1)" strokeWidth={2.5} animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }} className="glass-card rounded-xl p-6"
        >
          <h3 className="font-display font-semibold mb-3">Top companies</h3>
          <div className="space-y-2">
            {companies.slice(0, 5).map((c) => (
              <Link to="/placement/shortlist" key={c.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.role} · {c.ctc}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.5 }} className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Active drives</h3>
          <Link to="/placement/drives"><Button size="sm" variant="ghost" className="text-primary">Manage <ArrowUpRight className="h-3 w-3 ml-1" /></Button></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium hidden md:table-cell">Venue</th>
                <th className="pb-3 font-medium">Applicants</th>
                <th className="pb-3 font-medium">Offers</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {drives.map((d) => {
                const co = companies.find((c) => c.id === d.companyId);
                const o = Object.values(d.applicantStatus).filter((x) => x === "offered").length;
                return (
                  <tr key={d.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 font-medium">{co?.name}</td>
                    <td className="py-3 text-muted-foreground">{new Date(d.date).toLocaleDateString()}</td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">{d.venue}</td>
                    <td className="py-3">{d.applicantIds.length}</td>
                    <td className="py-3 font-display font-semibold text-success">{o}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                        d.status === "completed" ? "bg-success/15 text-success border-success/30" :
                        d.status === "in_progress" ? "bg-info/15 text-info border-info/30" :
                        "bg-warning/15 text-warning border-warning/30"
                      }`}>{d.status.replace("_", " ")}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default PlacementDashboard;
