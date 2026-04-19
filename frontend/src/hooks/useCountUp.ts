import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, suffix = "", duration = 1500) {
  const [display, setDisplay] = useState("0" + suffix);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(eased * target);
      setDisplay(current + suffix);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, suffix, duration]);

  return display;
}