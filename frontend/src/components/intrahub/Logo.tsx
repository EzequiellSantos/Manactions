import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  compact?: boolean;
}

export function Logo({ className, compact = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-primary-glow">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
          <defs>
            <linearGradient id="manactions-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B5BDB" />
              <stop offset="100%" stopColor="#4C6EF5" />
            </linearGradient>
            
            <filter id="drop-shadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#3B5BDB" floodOpacity="0.24"/>
            </filter>
          </defs>

          <rect x="32" y="32" width="448" height="448" rx="128" fill="url(#manactions-grad)" filter="url(#drop-shadow)" />

          <path d="M140 360V180L210 270L256 210L302 270L372 180V360" stroke="#FFFFFF" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round"/>
          
          <path d="M340 360H380" stroke="#FFFFFF" strokeWidth="44" strokeLinecap="round"/>
        </svg>

      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight">Manactions</span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Central corporativa
          </span>
        </div>
      )}
    </div>
  );
}
