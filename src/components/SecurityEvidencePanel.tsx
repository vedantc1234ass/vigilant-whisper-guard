import { Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityIndicator {
  indicator: string;
  confidence: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  reason: string;
}

const severityStyle: Record<string, string> = {
  Low: "border-success/30 text-success bg-success/5",
  Medium: "border-warning/30 text-warning bg-warning/5",
  High: "border-orange-400/30 text-orange-400 bg-orange-400/5",
  Critical: "border-destructive/30 text-destructive bg-destructive/5",
};

const barColor: Record<string, string> = {
  Low: "bg-success",
  Medium: "bg-warning",
  High: "bg-orange-400",
  Critical: "bg-destructive",
};

const SecurityEvidencePanel = ({ indicators }: { indicators: SecurityIndicator[] }) => {
  if (!indicators?.length) return null;

  return (
    <div className="glass-card rounded-xl border border-border/30 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <Fingerprint className="w-4 h-4 text-primary" />
        <span className="font-semibold text-foreground text-sm">Security Evidence Panel</span>
        <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
          {indicators.length} INDICATORS
        </span>
      </div>

      <div className="space-y-3">
        {indicators.map((ind, i) => (
          <div key={i} className="rounded-lg border border-border/30 bg-muted/20 p-3.5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-sm font-medium text-foreground">{ind.indicator}</span>
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                  severityStyle[ind.severity] || severityStyle.Low
                )}
              >
                {ind.severity}
              </span>
            </div>
            <p className="text-xs text-foreground/70 mb-2.5 leading-relaxed">{ind.reason}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", barColor[ind.severity] || barColor.Low)}
                  style={{ width: `${ind.confidence}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-muted-foreground w-10 text-right">{ind.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityEvidencePanel;
