import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CalendarDays, MapPin, Briefcase, DollarSign, Building2, CheckCircle2, Clock, Users
} from "lucide-react";
import { PlacementAPI } from "@/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: "bg-warning/15 text-warning border-warning/30",
  ACTIVE:   "bg-success/15 text-success border-success/30",
  COMPLETED:"bg-secondary/40 text-muted-foreground",
};

const StudentDrives = () => {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    PlacementAPI.drives().then(d => { setDrives(d); setLoading(false); });
  }, []);

  const apply = async (driveId: string) => {
    setApplying(driveId);
    try {
      await PlacementAPI.applyToDrive(driveId);
      setDrives(prev => prev.map(d => d.id === driveId ? { ...d, hasApplied: true, applicantCount: (d.applicantCount || 0) + 1 } : d));
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(null);
    }
  };

  const active  = drives.filter(d => d.status === "ACTIVE" || d.status === "UPCOMING");
  const closed  = drives.filter(d => d.status === "COMPLETED");

  const DriveCard = ({ d }: { d: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5 flex flex-col gap-4 hover:shadow-elevated transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xl font-bold text-primary-foreground shadow-glow shrink-0">
            {(d.company?.name || "?")?.[0]}
          </div>
          <div>
            <p className="font-display font-semibold text-foreground">{d.company?.name || "Company"}</p>
            <p className="text-xs text-muted-foreground">{d.title}</p>
          </div>
        </div>
        <Badge className={cn("text-[10px] shrink-0", STATUS_COLORS[d.status] ?? STATUS_COLORS.UPCOMING)}>
          {d.status?.toLowerCase()}
        </Badge>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Briefcase className="h-3 w-3" />{d.role || "—"}</span>
        <span className="flex items-center gap-1.5"><DollarSign className="h-3 w-3" />{d.salary || "—"}</span>
        <span className="flex items-center gap-1.5"><CalendarDays className="h-3 w-3" />{new Date(d.date).toLocaleDateString()}</span>
        <span className="flex items-center gap-1.5"><Users className="h-3 w-3" />{d.applicantCount ?? 0} applied</span>
        {d.location && <span className="flex items-center gap-1.5 col-span-2"><MapPin className="h-3 w-3" />{d.location}</span>}
      </div>

      {/* Type badge + CTA */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-[10px]">{d.type?.replace("_", " ") || "Full Time"}</Badge>
        {d.status === "COMPLETED" ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Drive closed</span>
        ) : d.hasApplied ? (
          <span className="text-xs text-success flex items-center gap-1.5 font-medium"><CheckCircle2 className="h-3.5 w-3.5" />Applied</span>
        ) : (
          <Button
            size="sm"
            disabled={applying === d.id}
            onClick={() => apply(d.id)}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-8 text-xs"
          >
            {applying === d.id ? "Applying..." : "Apply Now"}
          </Button>
        )}
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout
      role="student"
      title="Placement Drives"
      subtitle="Browse active company drives and submit your application."
    >
      <Tabs defaultValue="active">
        <TabsList className="mb-5 bg-secondary/30 p-1 rounded-xl">
          <TabsTrigger value="active" className="rounded-lg px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Active Drives
            {active.length > 0 && <span className="ml-2 bg-primary/20 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-bold">{active.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="closed" className="rounded-lg px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Past Drives
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {loading ? (
            <div className="glass-card rounded-xl p-16 text-center text-muted-foreground animate-pulse">Loading drives...</div>
          ) : active.length === 0 ? (
            <div className="glass-card rounded-xl p-16 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold">No active drives right now</p>
              <p className="text-xs text-muted-foreground mt-1">Check back soon — drives will appear here when scheduled.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {active.map(d => <DriveCard key={d.id} d={d} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed">
          {closed.length === 0 ? (
            <div className="glass-card rounded-xl p-16 text-center text-muted-foreground">No completed drives yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {closed.map(d => <DriveCard key={d.id} d={d} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default StudentDrives;
