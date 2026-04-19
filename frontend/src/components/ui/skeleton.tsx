import { QuizCardSkeleton } from "@/components/ui/Skeleton";
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-muted ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer
        bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export function QuizCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-6 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}