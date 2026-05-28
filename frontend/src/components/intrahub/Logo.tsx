import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  compact?: boolean;
}

export function Logo({ className, compact = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-primary-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20V8l8-5 8 5v12" />
          <path d="M9 20v-6h6v6" />
        </svg>
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight">IntraHub</span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Central corporativa
          </span>
        </div>
      )}
    </div>
  );
}
