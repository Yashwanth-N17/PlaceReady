import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, Users, Briefcase, ArrowLeft } from "lucide-react";

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

const LoginSelection = () => {
  return (
    <div className="min-h-screen hero-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center relative z-10"
      >
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
          Choose your Portal
        </h1>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
          Access your personalized placement dashboard by selecting your role below.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={r.href} className="block h-full group">
                <div className="glass-card rounded-2xl p-8 h-full hover:shadow-glow transition-all relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${r.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className="rounded-xl bg-primary/10 text-primary p-3 w-fit mx-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <r.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-display font-semibold">{r.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{r.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSelection;
