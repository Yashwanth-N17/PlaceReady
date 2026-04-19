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
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] as const },
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
    desc: "Monitor batch performance, identify gaps, and upload student data effortlessly.",
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
    desc: "Match students to companies, generate shortlists, and track placement trends.",
    icon: Briefcase,
    href: "/placement/login",
    accent: "from-primary/20 to-primary/5",
    desc: "Match students to companies, generate shortlists, track placement trends.",
    icon: Briefcase,
    href: "/placement/login",
    tag: "Placement Portal",
    color: "text-success",
    bg: "bg-success/8 group-hover:bg-success/14",
    border: "group-hover:border-success/40",
  },
];

const NAV_LINKS = [
  { label: "For Roles", href: "#roles" },
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
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(200 95% 55% / 0.03) 0%, transparent 60%)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
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
  const boxShadow = useTransform(
    scrollY,
    [0, 80],
    ["0 0 0px rgba(0,0,0,0)", "0 4px 24px rgba(0,0,0,0.3)"]
  );

  return (
    <motion.nav
      className="sticky top-0 z-50 backdrop-blur-xl border-b border-border/50"
      style={{
        backgroundColor,
        borderColor,
        boxShadow,
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

        <div className="hidden md:flex items-center gap-8 text-base text-muted-foreground">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="relative hover:text-foreground transition-colors duration-200 group"
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

  const gridParallaxY = useTransform(scrollYProgress, [0, 1], [0, 40 * parallax]);
  const badgeParallaxY = useTransform(scrollYProgress, [0, 1], [0, 6 * parallax]);
  const titleParallaxY = useTransform(scrollYProgress, [0, 1], [0, 12 * parallax]);
  const subParallaxY = useTransform(scrollYProgress, [0, 1], [0, 18 * parallax]);
  const ctaParallaxY = useTransform(scrollYProgress, [0, 1], [0, 24 * parallax]);
  const chipsParallaxY = useTransform(scrollYProgress, [0, 1], [0, 30 * parallax]);

  return (
    <div className="min-h-screen hero-bg text-foreground">
      <AmbientBlobs />
      <Navbar />

      <section ref={heroRef} className="relative overflow-hidden pt-20 pb-28">
        <motion.div
          className="absolute inset-0 grid-pattern opacity-25"
          style={{ y: gridParallaxY }}
          aria-hidden
        />

        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div style={{ y: badgeParallaxY }} className="will-change-transform">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-sm text-muted-foreground mb-6"
              >
                <motion.span
                  animate={{ rotate: [0, 15, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="h-3 w-3 text-primary" />
                </motion.span>
                AI-powered placement intelligence
              </motion.div>
            </motion.div>

            <motion.div style={{ y: titleParallaxY }} className="will-change-transform">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-7xl font-display font-bold tracking-tighter leading-[1.05]"
              >
                Placement Readiness,{" "}
                <br className="hidden md:block" />
                <span className="relative inline-block">
                  <span className="text-gradient">Zero Manual Effort</span>
                  <motion.span
                    className="absolute -bottom-1 left-0 h-[2px] w-full origin-left rounded-full bg-gradient-to-r from-primary to-primary/40"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              </motion.h1>
            </motion.div>

            <motion.div style={{ y: subParallaxY }} className="will-change-transform">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                One unified platform for student performance, training, and placement
                coordination — built to replace scattered Excel sheets, forms, and notebooks.
              </motion.p>
            </motion.div>

            <motion.div style={{ y: ctaParallaxY }} className="will-change-transform">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
                className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
              >
                <a href="#roles">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90 group shadow-glow animate-pulse-glow"
                      size="lg"
                    >
                      Choose your role
                      <motion.span
                        className="ml-2 inline-flex"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.span>
                    </Button>
                  </motion.div>
                </a>
              </motion.div>
            </motion.div>

            <motion.div style={{ y: chipsParallaxY }} className="will-change-transform">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-base text-muted-foreground"
              >
                {["Bulk Excel import", "Role-based access", "Real-time analytics", "AI insights"].map(
                  (t, i) => (
                    <motion.div
                      key={t}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 + i * 0.08, duration: 0.4 }}
                    >
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>{t}</span>
                    </motion.div>
                  )
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="roles" className="py-20 border-t border-border/50">
        <div className="container">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-base font-medium uppercase tracking-widest text-primary mb-3">
              Get started
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Pick your portal
            </h2>
            <p className="mt-3 text-lg text-muted-foreground leading-relaxed">

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
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ willChange: "transform" }}
                >
                  <Link to={r.href} className="block h-full">
                    <div
                      className={`glass-card rounded-2xl p-8 h-full hover:shadow-glow transition-shadow duration-500 group relative overflow-hidden`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${r.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      />
                      <div className="relative">
                        <motion.div
                          className="rounded-xl bg-primary/10 text-primary p-3 w-fit group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                          whileHover={{ rotate: 8 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <r.icon className="h-6 w-6" />
                        </motion.div>
                        <h3 className="mt-5 text-2xl font-display font-semibold">{r.title}</h3>
                        <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                          {r.desc}
                        </p>
                        <div className="mt-5 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                          Go to portal <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
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
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="problem" className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-base font-medium uppercase tracking-widest text-primary mb-3">
              The Problem
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Placement is still{" "}
              <span className="text-gradient">running on chaos</span>
            </h2>
            <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
              Every campus manages placement through a patchwork of spreadsheets, WhatsApp threads, and gut feelings.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-60px" }}
          >
            {[
              {
                icon: Eye,
                title: "No visibility",
                desc: "Faculty can't see which students are at risk until it's too late for intervention.",
              },
              {
                icon: Zap,
                title: "Manual bottlenecks",
                desc: "Shortlisting is done by hand — slow, error-prone, and impossible to audit.",
              },
              {
                icon: Rocket,
                title: "Zero personalisation",
                desc: "One-size-fits-all training ignores individual skill gaps and learning curves.",
              },
            ].map((p) => (
              <motion.div key={p.title} variants={staggerItem}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="glass-card rounded-xl p-6 hover:shadow-elevated transition-shadow duration-300 h-full"
                >
                  <motion.div
                    className="rounded-lg bg-destructive/10 text-destructive p-2.5 w-fit"
                    whileHover={{ rotate: -6 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p.icon className="h-5 w-5" />
                  </motion.div>
                  <h3 className="mt-4 text-xl font-display font-semibold">{p.title}</h3>
                  <p className="mt-2 text-base text-muted-foreground leading-relaxed">{p.desc}</p>
                </motion.div>
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
          </motion.div>
        </div>
      </section>

      <section id="impact" className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-base font-medium uppercase tracking-widest text-primary mb-3">
              Impact
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Numbers that move the needle
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-60px" }}
          >
            {[
              {
                value: 90,
                suffix: "%",
                label: "Less admin work",
                desc: "Excel mapping + auto-import eliminates repetitive data entry.",
              },
              {
                value: 32,
                suffix: "x",
                label: "Faster shortlisting",
                desc: "One-click filtering against company eligibility profiles.",
              },
              {
                value: 47,
                suffix: "%",
                label: "Higher conversion",
                desc: "Skill-based remediation outperforms generic CGPA cutoffs.",
              },
            ].map((m) => (
              <motion.div key={m.label} variants={staggerItem}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="glass-card rounded-xl p-8 h-full hover:shadow-glow transition-shadow duration-500"
                >
                  <AnimatedStat value={m.value} suffix={m.suffix} />
                  <h3 className="mt-3 font-display font-semibold text-xl">{m.label}</h3>
                  <p className="mt-2 text-base text-muted-foreground leading-relaxed">{m.desc}</p>
                </motion.div>
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
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-base font-medium uppercase tracking-widest text-primary mb-3">
              Features
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
      {/* ── FEATURES ── */}
      <section id="features" className="py-20 border-t border-border/40">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-xl mx-auto text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              Built for every role
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-60px" }}
          >
            {[
              {
                icon: LayoutDashboard,
                title: "Unified Dashboard",
                desc: "Single source of truth for student, faculty, and placement teams.",
              },
              {
                icon: Brain,
                title: "AI-Powered Insights",
                desc: "Predict placement readiness and surface weak areas automatically.",
              },
              {
                icon: LineChart,
                title: "Mock Test Tracking",
                desc: "Track every assessment across aptitude, coding, and soft skills.",
              },
              {
                icon: Target,
                title: "Personalised Training",
                desc: "Adaptive modules tailored to each student's gaps.",
              },
              {
                icon: Users,
                title: "Batch Analytics",
                desc: "Faculty see aggregate trends and at-risk cohorts at a glance.",
              },
              {
                icon: Trophy,
                title: "One-Click Shortlist",
                desc: "Match students to companies via dynamic eligibility profiles.",
              },
            ].map((f) => (
              <motion.div key={f.title} variants={staggerItem}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="glass-card rounded-xl p-6 h-full group hover:shadow-elevated transition-shadow duration-300"
                >
                  <motion.div
                    className="rounded-lg bg-primary/10 text-primary p-2.5 w-fit group-hover:bg-primary/20 transition-colors duration-300"
                    whileHover={{ rotate: 8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <f.icon className="h-5 w-5" />
                  </motion.div>
                  <h3 className="mt-4 font-display font-semibold">{f.title}</h3>
                  <p className="mt-2 text-base text-muted-foreground leading-relaxed">{f.desc}</p>
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
          </motion.div>
        </div>
      </section>

      <section className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div
            {...fadeUp}
            className="glass-card rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <motion.div
              className="absolute -top-24 -right-24 h-64 w-64 rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(200 95% 55% / 0.08) 0%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 5, repeat: Infinity }}
            />

            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight max-w-2xl mx-auto">
                Ready to{" "}
                <span className="text-gradient">transform</span>{" "}
                placement prep?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
                Join the colleges already running placement seasons on autopilot.
              </p>
              <a href="#roles" className="inline-block mt-8">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
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

      <footer className="border-t border-border/50 py-12">
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
              <p className="mt-3 text-base text-muted-foreground max-w-xs leading-relaxed">
              <p className="text-sm text-muted-foreground max-w-xs">
                AI-powered placement readiness for the modern campus.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-base">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-semibold text-foreground mb-3">Product</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <a href="#features" className="hover:text-foreground transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#impact" className="hover:text-foreground transition-colors">
                      Impact
                    </a>
                  </li>
                  <li>
                    <Link to="/login" className="hover:text-foreground transition-colors">
                      Sign in
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-3">Company</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Privacy
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-3">Connect</p>
                <div className="flex gap-3 text-muted-foreground">
                  {[Twitter, Github, Linkedin].map((Icon, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      className="hover:text-foreground transition-colors"
                      whileHover={{ y: -2, scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 PlaceReady. Built for campuses that ship.</p>
            <p>Made with intention.</p>
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
