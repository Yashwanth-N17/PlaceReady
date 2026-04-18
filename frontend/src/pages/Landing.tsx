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
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
};

const roles = [
  {
    id: "student",
    title: "I'm a Student",
    desc: "Track your readiness score, weak areas, and personalized training paths.",
    icon: GraduationCap,
    href: "/student/login",
    accent: "from-primary/20 to-primary/5",
  },
  {
    id: "faculty",
    title: "I'm Faculty",
    desc: "Monitor batch performance, identify gaps, and upload student data effortlessly.",
    icon: Users,
    href: "/faculty/login",
    accent: "from-info/20 to-info/5",
  },
  {
    id: "placement",
    title: "I'm a Placement Officer",
    desc: "Match students to companies, generate shortlists, and track placement trends.",
    icon: Briefcase,
    href: "/placement/login",
    accent: "from-success/20 to-success/5",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen hero-bg text-foreground">
      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1.5">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold tracking-tight">PlaceReady</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#roles" className="hover:text-foreground transition-colors">For Roles</a>
            <a href="#problem" className="hover:text-foreground transition-colors">Problem</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#impact" className="hover:text-foreground transition-colors">Impact</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="#roles"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Sign in</Button></Link>
          </div>
        </div>
      </nav>

      {/* HERO — toned down, no orange */}
      <section className="relative overflow-hidden pt-20 pb-24">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="container relative">
          <motion.div {...fadeUp} className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3 w-3 text-primary" />
              AI-powered placement intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter leading-[1.05]">
              Placement Readiness, <br className="hidden md:block" />
              <span className="text-primary">Zero Manual Effort</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              One unified platform for student performance, training, and placement coordination —
              built to replace scattered Excel sheets, forms, and notebooks.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#roles">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
                  Choose your role
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="border-border bg-secondary/30 backdrop-blur-sm">
                Watch Demo
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {["Bulk Excel import", "Role-based access", "Real-time analytics", "AI insights"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ROLE PICKER */}
      <section id="roles" className="py-20 border-t border-border/50">
        <div className="container">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Get started</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Pick your portal
            </h2>
            <p className="mt-3 text-muted-foreground">
              Each role gets a dedicated workspace tailored to its workflow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Link to={r.href} className="block h-full">
                  <div className={`glass-card rounded-2xl p-8 h-full hover:shadow-elevated transition-all group relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${r.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative">
                      <div className="rounded-xl bg-primary/10 text-primary p-3 w-fit group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <r.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-5 text-2xl font-display font-semibold">{r.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                      <div className="mt-6 inline-flex items-center text-sm font-medium text-primary">
                        Continue <ArrowUpRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">The Problem</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Placement prep today is broken
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Colleges juggle dozens of spreadsheets, lose visibility into actual readiness, and rely on CGPA
              instead of skills.
            </p>
          </motion.div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: Database, title: "Data Fragmentation", desc: "Aptitude, coding, and soft-skill scores live in separate Excel sheets, forms, and notebooks." },
              { icon: Eye, title: "No Unified View", desc: "Faculty can't track a single student's journey across categories without manual stitching." },
              { icon: Zap, title: "Reactive, Not Predictive", desc: "Weak areas surface only after placement season — by then it's too late to remediate." },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass-card rounded-xl p-6 hover:shadow-elevated transition-shadow"
              >
                <div className="rounded-lg bg-destructive/10 text-destructive p-2.5 w-fit">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-display font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Impact</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Numbers that move the needle
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { value: "90%", label: "Less admin work", desc: "Excel mapping + auto-import eliminates repetitive data entry." },
              { value: "3.2x", label: "Faster shortlisting", desc: "One-click filtering against company eligibility profiles." },
              { value: "47%", label: "Higher conversion", desc: "Skill-based remediation outperforms generic CGPA cutoffs." },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass-card rounded-xl p-8"
              >
                <p className="text-6xl font-display font-bold tracking-tight text-primary">{m.value}</p>
                <h3 className="mt-3 font-display font-semibold text-lg">{m.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Built for every role
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: LayoutDashboard, title: "Unified Dashboard", desc: "Single source of truth for student, faculty, and placement teams." },
              { icon: Brain, title: "AI-Powered Insights", desc: "Predict placement readiness and surface weak areas automatically." },
              { icon: LineChart, title: "Mock Test Tracking", desc: "Track every assessment across aptitude, coding, and soft skills." },
              { icon: Target, title: "Personalized Training", desc: "Adaptive modules tailored to each student's gaps." },
              { icon: Users, title: "Batch Analytics", desc: "Faculty see aggregate trends and at-risk cohorts at a glance." },
              { icon: Trophy, title: "One-Click Shortlist", desc: "Match students to companies via dynamic eligibility profiles." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="rounded-lg bg-primary/10 text-primary p-2.5 w-fit">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div
            {...fadeUp}
            className="glass-card rounded-3xl p-12 md:p-16 text-center"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight max-w-2xl mx-auto">
              Ready to <span className="text-primary">transform</span> placement prep?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Join the colleges already running placement seasons on autopilot.
            </p>
            <a href="#roles" className="inline-block mt-8">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/50 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <div className="rounded-md bg-primary p-1.5">
                  <GraduationCap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold">PlaceReady</span>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground max-w-xs">
                AI-powered placement readiness for the modern campus.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-semibold mb-3">Product</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#impact" className="hover:text-foreground transition-colors">Impact</a></li>
                  <li><a href="#roles" className="hover:text-foreground transition-colors">Sign in</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-3">Company</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-3">Connect</p>
                <div className="flex gap-3 text-muted-foreground">
                  <a href="#" className="hover:text-foreground transition-colors"><Twitter className="h-4 w-4" /></a>
                  <a href="#" className="hover:text-foreground transition-colors"><Github className="h-4 w-4" /></a>
                  <a href="#" className="hover:text-foreground transition-colors"><Linkedin className="h-4 w-4" /></a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>© 2026 PlaceReady. Built for campuses that ship.</p>
            <p>Made with intention.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
