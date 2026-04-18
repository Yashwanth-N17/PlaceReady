import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Lock, LucideIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
  role: "student" | "faculty" | "placement";
  title: string;
  subtitle: string;
  icon: LucideIcon;
  redirectTo: string;
  accentLabel: string;
}

export const RoleAuth = ({ role, title, subtitle, icon: Icon, redirectTo, accentLabel }: Props) => {
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Welcome, ${accentLabel}`);
    setTimeout(() => navigate(redirectTo), 350);
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All portals
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 shadow-elevated">
          <div className="flex items-center justify-center mb-6">
            <div className="rounded-xl bg-primary p-3">
              <Icon className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <p className="text-center text-xs uppercase tracking-widest text-primary font-medium">{accentLabel} Portal</p>
          <h1 className="text-2xl font-display font-bold text-center mt-1">{title}</h1>
          <p className="text-center text-sm text-muted-foreground mt-2">{subtitle}</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" required placeholder="you@college.edu" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" required placeholder="••••••••" className="pl-9" />
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Sign in to {accentLabel}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Don't have an account? <Link to="#" onClick={() => toast.info("Registration is handled by campus administrators.")} className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Wrong portal? <Link to="/" className="text-primary hover:underline">Pick another role</Link>
        </div>
      </motion.div>
    </div>
  );
};
