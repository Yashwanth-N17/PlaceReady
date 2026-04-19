import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  Database,
  Eye,
  Zap,
  LineChart,
  Users,
  Target,
  Rocket,
  GraduationCap,
  Brain,
  Trophy,
  Github,
  Twitter,
  Linkedin,
  CheckCircle2,
  LayoutDashboard,
  Briefcase,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] as const },
};

const roles = [
  {
    id: "student",
    title: "Student",
    desc: "Track readiness score, weak areas, and personalized training paths.",
    icon: GraduationCap,
    href: "/student/login",
    tag: "Student Portal",
    color: "text-primary",
    bg: "bg-primary/8 group-hover:bg-primary/14",
    border: "group-hover:border-primary/40",
  },
  {
    id: "faculty",
    title: "Faculty",
    desc: "Monitor batch performance, identify gaps, and upload student data.",
    icon: Users,
    href: "/faculty/login",
    tag: "Faculty Portal",
    color: "text-info",
    bg: "bg-info/8 group-hover:bg-info/14",
    border: "group-hover:border-info/40",
  },
  {
    id: "placement",
    title: "Placement Officer",
    desc: "Match students to companies, generate shortlists, track placement trends.",
    icon: Briefcase,
    href: "/placement/login",
    tag: "Placement Portal",
    color: "text-success",
    bg: "bg-success/8 group-hover:bg-success/14",
    border: "group-hover:border-success/40",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen hero-bg text-foreground">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 h-14 backdrop-blur-xl bg-background/75 border-b border-border/50">
        <div className="container h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold tracking-tight text-foreground">PlaceReady</span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            {["#roles", "#problem", "#features", "#impact"].map((href) => (
              <a key={href} href={href} className="hover:text-foreground transition-colors capitalize">
                {href.slice(1)}
              </a>
            ))}
          </div>

          <Link to="/login">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-border/60 hover:border-primary/50 hover:text-primary transition-all px-4"
            >
              Sign in
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-24 pb-28">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        {/* Subtle glow blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/6 rounded-full blur-[100px] pointer-events-none" />

        <div className="container relative">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground mb-8 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-primary" />
              AI-powered campus placement platform
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight leading-[1.08] text-foreground">
              Placement readiness,
              <br />
              <span className="text-gradient">zero manual effort</span>
            </h1>

            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              One unified platform for student performance tracking, skill-based training, and placement
              coordination — built to replace fragmented Excel sheets and notebooks.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#roles">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium group h-11">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </a>
              <Button
                size="lg"
                variant="outline"
                className="border-border/60 bg-muted/20 hover:border-primary/40 h-11"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View demo
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Bulk Excel import", "Role-based access", "Real-time analytics", "AI-powered insights"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ROLE PICKER ── */}
      <section id="roles" className="py-20 border-t border-border/40">
        <div className="container">
          <motion.div {...fadeUp} className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Get Started
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              Choose your portal
            </h2>
            <p className="mt-3 text-muted-foreground text-sm">
              Each role gets a dedicated workspace tailored to its workflow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {roles.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <Link to={r.href} className="block h-full group">
                  <div
                    className={`
                      glass-card rounded-xl p-6 h-full transition-all duration-200 border border-border/60
                      ${r.border} hover:shadow-elevated
                    `}
                  >
                    <div className={`rounded-lg p-2.5 w-fit mb-4 transition-colors ${r.bg}`}>
                      <r.icon className={`h-5 w-5 ${r.color}`} />
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${r.color} block mb-2`}>
                      {r.tag}
                    </span>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                      {r.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                    <div className={`mt-4 inline-flex items-center text-sm font-medium ${r.color}`}>
                      Enter portal
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" className="py-20 border-t border-border/40">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">The Problem</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              Placement prep today is broken
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Colleges manage dozens of spreadsheets, lose visibility into actual student readiness, and
              rely on CGPA instead of real skills.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Database,
                title: "Data Fragmentation",
                desc: "Aptitude, coding, and soft-skill scores live in separate Excel sheets, forms, and notebooks.",
                color: "text-destructive bg-destructive/8",
              },
              {
                icon: Eye,
                title: "No Unified View",
                desc: "Faculty can't track a student's journey across categories without manual stitching.",
                color: "text-warning bg-warning/8",
              },
              {
                icon: Zap,
                title: "Reactive, Not Predictive",
                desc: "Weak areas surface only after placement season — by then it's too late to remediate.",
                color: "text-info bg-info/8",
              },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="glass-card rounded-xl p-6 border border-border/60"
              >
                <div className={`rounded-lg p-2.5 w-fit mb-4 ${p.color.split(" ")[1]}`}>
                  <p.icon className={`h-5 w-5 ${p.color.split(" ")[0]}`} />
                </div>
                <h3 className="text-base font-display font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT ── */}
      <section id="impact" className="py-20 border-t border-border/40">
        <div className="container">
          <motion.div {...fadeUp} className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Impact</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              Numbers that matter
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { value: "90%", label: "Less admin work", desc: "Excel mapping + auto-import eliminates repetitive data entry." },
              { value: "3.2×", label: "Faster shortlisting", desc: "One-click filtering against company eligibility profiles." },
              { value: "47%", label: "Higher placement rate", desc: "Skill-based remediation outperforms generic CGPA cutoffs." },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-xl p-8 border border-border/60 text-center"
              >
                <p className="text-5xl font-display font-bold text-gradient mb-3">{m.value}</p>
                <h3 className="font-display font-semibold text-foreground mb-1">{m.label}</h3>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 border-t border-border/40">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-xl mx-auto text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              Built for every role
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { icon: LayoutDashboard, title: "Unified Dashboard", desc: "Single source of truth for students, faculty, and placement teams." },
              { icon: Brain, title: "AI-Powered Insights", desc: "Predict placement readiness and surface weak areas automatically." },
              { icon: LineChart, title: "Assessment Tracking", desc: "Track every test across aptitude, coding, and soft skills." },
              { icon: Target, title: "Personalized Training", desc: "Adaptive modules tailored to each student's individual gaps." },
              { icon: Users, title: "Batch Analytics", desc: "Faculty see aggregate trends and at-risk cohorts at a glance." },
              { icon: Trophy, title: "Smart Shortlisting", desc: "Match students to companies via dynamic eligibility profiles." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="glass-card rounded-xl p-5 border border-border/60 hover:border-primary/30 transition-all group"
              >
                <div className="rounded-lg bg-primary/8 p-2.5 w-fit mb-3 group-hover:bg-primary/14 transition-colors">
                  <f.icon className="h-4.5 w-4.5 text-primary" style={{ width: "1.125rem", height: "1.125rem" }} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 border-t border-border/40">
        <div className="container">
          <motion.div
            {...fadeUp}
            className="glass-card rounded-2xl p-10 md:p-16 text-center border border-border/60 max-w-3xl mx-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/3 pointer-events-none" />
            <div className="relative">
              <h2 className="text-2xl md:text-4xl font-display font-bold tracking-tight text-foreground mb-4">
                Ready to transform placement prep?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed">
                Join campuses already running placement seasons on autopilot with PlaceReady.
              </p>
              <a href="#roles">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium h-11">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/40 py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-3">
                <div className="rounded-lg bg-primary p-1.5">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="font-display font-bold text-foreground">PlaceReady</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                AI-powered placement readiness for the modern campus.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-semibold text-foreground mb-3">Product</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#impact" className="hover:text-foreground transition-colors">Impact</a></li>
                  <li><Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-3">Company</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-3">Connect</p>
                <div className="flex gap-3 text-muted-foreground">
                  <a href="#" className="hover:text-foreground transition-colors"><Twitter className="h-4 w-4" /></a>
                  <a href="#" className="hover:text-foreground transition-colors"><Github className="h-4 w-4" /></a>
                  <a href="#" className="hover:text-foreground transition-colors"><Linkedin className="h-4 w-4" /></a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
            <p>© 2026 PlaceReady. All rights reserved.</p>
            <p>Built for campuses that care about outcomes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
