import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  etapas: string[];
  etapaAtual: number;
}

export function Stepper({ etapas, etapaAtual }: StepperProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {etapas.map((etapa, index) => {
        const step = index + 1;
        const done = step < etapaAtual;
        const active = step === etapaAtual;
        return (
          <div key={etapa} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                done && "border-success bg-success text-white",
                active && "border-primary bg-primary text-primary-foreground",
                !done && !active && "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : step}
            </div>
            <span className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>
              {etapa}
            </span>
          </div>
        );
      })}
    </div>
  );
}
