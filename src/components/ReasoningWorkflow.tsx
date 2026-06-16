import { Cpu, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReasoningStep {
  step: number;
  title: string;
  finding: string;
  status: "clear" | "flagged" | "info";
}

const statusConfig = {
  clear: { icon: CheckCircle2, color: "text-success", ring: "border-success/40 bg-success/10" },
  flagged: { icon: AlertTriangle, color: "text-destructive", ring: "border-destructive/40 bg-destructive/10" },
  info: { icon: Info, color: "text-primary", ring: "border-primary/40 bg-primary/10" },
};

const ReasoningWorkflow = ({ steps }: { steps: ReasoningStep[] }) => {
  if (!steps?.length) return null;

  return (
    <div className="glass-card rounded-xl border border-primary/20 p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <Cpu className="w-4 h-4 text-primary" />
        <span className="font-semibold text-foreground text-sm">Threat Investigation Workflow</span>
        <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
          MULTI-STEP REASONING
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
        <div className="space-y-4">
          {steps.map((s) => {
            const cfg = statusConfig[s.status] || statusConfig.info;
            const Icon = cfg.icon;
            return (
              <div key={s.step} className="relative flex gap-3.5">
                <div
                  className={cn(
                    "relative z-10 flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center",
                    cfg.ring
                  )}
                >
                  <Icon className={cn("w-4 h-4", cfg.color)} />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium text-foreground">
                    <span className="text-muted-foreground font-mono text-xs mr-1.5">Step {s.step}</span>
                    {s.title}
                  </p>
                  <p className="text-xs text-foreground/70 mt-0.5 leading-relaxed">{s.finding}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReasoningWorkflow;
