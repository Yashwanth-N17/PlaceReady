import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  value: number; // 0-100
  size?: number;
  label?: string;
}

function getColor(value: number) {
  if (value >= 80) return { stroke: "hsl(158 58% 46%)", label: "Excellent" };
  if (value >= 60) return { stroke: "hsl(245 70% 65%)", label: "Good" };
  if (value >= 40) return { stroke: "hsl(38 90% 56%)", label: "Fair" };
  return { stroke: "hsl(4 72% 58%)", label: "Needs Work" };
}

export const ReadinessRing = ({ value, size = 192, label = "Readiness" }: Props) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);
  const { stroke, label: statusLabel } = getColor(value);

  useEffect(() => {
    const t = setTimeout(() => setProgress(value), 200);
    return () => clearTimeout(t);
  }, [value]);

  const offset = circ - (progress / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad-pr" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stroke} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ring-grad-pr)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-4xl font-display font-bold leading-none"
          style={{ color: stroke }}
        >
          {Math.round(progress)}
        </motion.span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          {label}
        </span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[11px] font-medium mt-0.5"
          style={{ color: stroke }}
        >
          {statusLabel}
        </motion.span>
      </div>
    </div>
  );
};
