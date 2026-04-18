import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Role } from "@/components/RoleSidebar";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from "recharts";
import { Download, FileText } from "lucide-react";
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

interface Props { role: Role }

const Reports = ({ role }: Props) => {
  const [monthly, setMonthly] = useState<Awaited<ReturnType<typeof ReportsAPI.monthlyReadiness>>>([]);
  const [yoy, setYoy] = useState<Awaited<ReturnType<typeof ReportsAPI.yearOverYear>>>([]);
  const [heatmap, setHeatmap] = useState<Awaited<ReturnType<typeof ReportsAPI.skillHeatmap>>>([]);

  useEffect(() => {
    ReportsAPI.monthlyReadiness().then(setMonthly);
    ReportsAPI.yearOverYear().then(setYoy);
    ReportsAPI.skillHeatmap().then(setHeatmap);
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

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthly), "MonthlyReadiness");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(yoy), "YearOverYear");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(heatmap), "SkillHeatmap");
    XLSX.writeFile(wb, "placement-reports.xlsx");
    toast.success("Excel exported");
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("PlaceReady — Reports", 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22);

    autoTable(doc, {
      startY: 28, head: [["Month", "CSE-A", "CSE-B", "ECE"]],
      body: monthly.map((m) => [m.month, m.batchA, m.batchB, m.ece]),
      headStyles: { fillColor: [38, 175, 230] },
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Year", "Placement %", "Avg CTC (LPA)"]],
      body: yoy.map((y) => [y.year, y.placementRate, y.avgCtc]),
      headStyles: { fillColor: [38, 175, 230] },
    });

    doc.save("placement-reports.pdf");
    toast.success("PDF exported");
  };

  return (
    <DashboardLayout
      role={role}
      title="Reports"
      subtitle="Trends, gaps, and exportable summaries."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={exportPdf}><FileText className="h-4 w-4 mr-2" />PDF</Button>
          <Button size="sm" onClick={exportExcel} className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
            <Download className="h-4 w-4 mr-2" />Excel
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                    <td key={c.skill} className={cn("p-3 rounded text-center font-display font-semibold", colorFor(c.value))}>
                      {c.value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Reports;
