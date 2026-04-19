import { useRef } from "react";
import { useCountUp } from "../hooks/useCountUp";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
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
  Database,
} from "lucide-react";

/* ─── Shared animation variants ─────────────────────────────── */

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ─── Data ───────────────────────────────────────────────────── */

const roles = [
  {
    id: "student",
    title: "Student",
    desc: "Track your readiness score, weak areas, and personalised training paths.",
    icon: GraduationCap,
    href: "/student/login",
    tag: "Student Portal",
    color: "text-primary",
    bg: "bg-primary/8 group-hover:bg-primary/14",
    border: "group-hover:border-primary/40",
    accent: "from-primary/20 to-primary/5",
  },
  {
    id: "faculty",
    title: "Faculty",
    desc: "Monitor batch performance, identify gaps, and upload student data effortlessly.",
    icon: Users,
    href: "/faculty/login",
    tag: "Faculty Portal",
    color: "text-info",
    bg: "bg-info/8 group-hover:bg-info/14",
    border: "group-hover:border-info/40",
    accent: "from-info/20 to-info/5",
  },
  {
    id: "placement",
    title: "Placement Officer",
    desc: "Match students to companies, generate shortlists, and track placement trends.",
    icon: Briefcase,
    href: "/placement/login",
    tag: "Placement Portal",
    color: "text-success",
    bg: "bg-success/8 group-hover:bg-success/14",
    border: "group-hover:border-success/40",
    accent: "from-success/20 to-success/5",
  },
];

const NAV_LINKS = [
  { label: "Roles", href: "#roles" },
  { label: "Problem", href: "#problem" },
  { label: "Features", href: "#features" },
  { label: "Impact", href: "#impact" },
] as const;

/* ─── AnimatedStat — only counts when visible ────────────────── */

function AnimatedStat({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const count = useCountUp(isInView ? value : 0, suffix, 1800);

  return (
    <p
      ref={ref}
      className="text-6xl font-display font-bold tracking-tight text-primary"
    >
      {count}
    </p>
  );
}

/* ─── Ambient background blobs ───────────────────────────────── */

function AmbientBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(200 95% 55% / 0.07) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(190 90% 60% / 0.05) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </div>
  );
}

/* ─── Scrolling navbar ───────────────────────────────────────── */

function Navbar() {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 80],
    ["hsl(220 30% 6% / 0.4)", "hsl(220 30% 6% / 0.85)"]
  );
  const borderColor = useTransform(
    scrollY,
    [0, 80],
    ["hsl(220 20% 18% / 0.2)", "hsl(220 20% 18% / 0.5)"]
  );

  return (
    <motion.nav
      className="sticky top-0 z-50 backdrop-blur-xl border-b border-border/50"
      style={{
        backgroundColor,
        borderColor,
      }}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            className="rounded-md bg-primary p-1.5"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </motion.div>
          <span className="font-display font-bold tracking-tight">PlaceReady</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="relative hover:text-foreground transition-colors duration-200 group capitalize"
            >
              {label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <Link to="/login">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-medium px-5"
            >
              Sign in
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.nav>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

const Landing = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const parallax = reduceMotion ? 0 : 1;

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const titleParallaxY = useTransform(scrollYProgress, [0, 1], [0, 12 * parallax]);
  const subParallaxY = useTransform(scrollYProgress, [0, 1], [0, 18 * parallax]);

  return (
    <div className="min-h-screen hero-bg text-foreground">
      <AmbientBlobs />
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative overflow-hidden pt-20 pb-28">
        <div className="absolute inset-0 grid-pattern opacity-25" aria-hidden />

        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground mb-6"
            >
              <Sparkles className="h-3 w-3 text-primary" />
              AI-powered placement intelligence
            </motion.div>

            <motion.div style={{ y: titleParallaxY }} className="will-change-transform">
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter leading-[1.05]">
                Placement Readiness, <br className="hidden md:block" />
                <span className="text-gradient">Zero Manual Effort</span>
              </h1>
            </motion.div>

            <motion.div style={{ y: subParallaxY }} className="will-change-transform">
              <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                One unified platform for student performance, training, and placement
                coordination — built to replace scattered Excel sheets and notebooks.
              </p>
            </motion.div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#roles">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group shadow-glow px-8 h-12">
                  Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="border-border/60 bg-muted/20 hover:border-primary/40 h-12">
                <BarChart3 className="mr-2 h-4 w-4" /> View Demo
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
          </div>
        </div>
      </section>

      {/* ── ROLE PICKER ── */}
      <section id="roles" className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Get started</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Choose your portal</h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Each role gets a dedicated workspace tailored to its workflow.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-60px" }}
          >
            {roles.map((r) => (
              <motion.div key={r.id} variants={staggerItem}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="h-full"
                >
                  <Link to={r.href} className="block h-full group">
                    <div className={`glass-card rounded-2xl p-8 h-full transition-all duration-300 border border-border/60 ${r.border} hover:shadow-elevated relative overflow-hidden`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${r.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <div className="relative z-10">
                        <div className={`rounded-xl p-3 w-fit mb-6 transition-colors ${r.bg}`}>
                          <r.icon className={`h-6 w-6 ${r.color}`} />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${r.color} block mb-3`}>
                          {r.tag}
                        </span>
                        <h3 className="text-2xl font-display font-bold text-foreground mb-3">{r.title}</h3>
                        <p className="text-base text-muted-foreground leading-relaxed mb-6">{r.desc}</p>
                        <div className={`inline-flex items-center text-sm font-semibold ${r.color}`}>
                          Enter portal <ArrowUpRight className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" className="py-24 border-t border-border/50 bg-secondary/10">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-xl mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">The Problem</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Placement prep is broken</h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Every campus manages placement through a patchwork of spreadsheets, WhatsApp threads, and gut feelings.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
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
                desc: "Faculty can't track a student's journey across categories without manual, time-consuming stitching.",
                color: "text-warning bg-warning/8",
              },
              {
                icon: Zap,
                title: "Reactive, Not Predictive",
                desc: "Weak areas surface only after placement season begins — by then it's too late to remediate.",
                color: "text-info bg-info/8",
              },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-2xl p-8 border border-border/60 hover:border-primary/20 transition-colors"
              >
                <div className={`rounded-xl p-3 w-fit mb-6 ${p.color.split(" ")[1]}`}>
                  <p.icon className={`h-6 w-6 ${p.color.split(" ")[0]}`} />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">{p.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT ── */}
      <section id="impact" className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Impact</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Numbers that matter</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { value: 90, suffix: "%", label: "Less admin work", desc: "Excel mapping + auto-import eliminates repetitive data entry tasks." },
              { value: 3.2, suffix: "×", label: "Faster shortlisting", desc: "One-click filtering against company eligibility profiles." },
              { value: 47, suffix: "%", label: "Higher conversion", desc: "Skill-based remediation outperforms generic CGPA cutoffs." },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-2xl p-8 border border-border/60 text-center hover:shadow-glow transition-all duration-500"
              >
                <AnimatedStat value={m.value} suffix={m.suffix} />
                <h3 className="mt-4 font-display font-semibold text-xl text-foreground mb-2">{m.label}</h3>
                <p className="text-base text-muted-foreground">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 border-t border-border/50 bg-secondary/5">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Built for every role</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: LayoutDashboard, title: "Unified Dashboard", desc: "Single source of truth for student, faculty, and placement teams." },
              { icon: Brain, title: "AI-Powered Insights", desc: "Predict placement readiness and surface weak areas automatically." },
              { icon: LineChart, title: "Assessment Tracking", desc: "Track every test across aptitude, coding, and soft skills." },
              { icon: Target, title: "Personalised Training", desc: "Adaptive modules tailored to each student's individual gaps." },
              { icon: Users, title: "Batch Analytics", desc: "Faculty see aggregate trends and at-risk cohorts at a glance." },
              { icon: Trophy, title: "Smart Shortlisting", desc: "Match students to companies via dynamic eligibility profiles." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass-card rounded-2xl p-8 border border-border/60 hover:border-primary/30 transition-all group"
              >
                <div className="rounded-xl bg-primary/8 p-3 w-fit mb-6 group-hover:bg-primary/14 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">{f.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div
            {...fadeUp}
            className="glass-card rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight max-w-3xl mx-auto mb-6">
                Ready to <span className="text-gradient">transform</span> placement prep?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed font-light">
                Join the campuses already running placement seasons on autopilot with PlaceReady.
              </p>
              <a href="#roles">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold h-14 px-10 rounded-xl shadow-glow text-lg">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/50 py-16 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-xs">
              <Link to="/" className="flex items-center gap-2 mb-6 group">
                <div className="rounded-lg bg-primary p-1.5 transition-transform group-hover:rotate-12">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-foreground">PlaceReady</span>
              </Link>
              <p className="text-base text-muted-foreground leading-relaxed">
                AI-powered placement readiness for the modern campus. Built for outcomes, not just tracking.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm">
              <div>
                <p className="font-bold text-foreground mb-4 uppercase tracking-widest text-xs">Product</p>
                <ul className="space-y-3 text-muted-foreground">
                  <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                  <li><a href="#impact" className="hover:text-primary transition-colors">Impact</a></li>
                  <li><Link to="/login" className="hover:text-primary transition-colors">Sign in</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-foreground mb-4 uppercase tracking-widest text-xs">Company</p>
                <ul className="space-y-3 text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-foreground mb-4 uppercase tracking-widest text-xs">Connect</p>
                <div className="flex gap-4">
                  {[Twitter, Github, Linkedin].map((Icon, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      whileHover={{ y: -3, scale: 1.1 }}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
            <p>© 2026 PlaceReady. All rights reserved.</p>
            <p className="flex items-center gap-2">
              Built with <Sparkles className="h-3 w-3 text-primary" /> for the future of education.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
