import { Gauge, ShieldAlert, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedRiskScoringProps {
  riskScore: number;
  riskCategory?: string;
  confidenceScore?: number;
  fraudLikelihood?: number;
  severityLevel?: string;
}

const categoryColor: Record<string, string> = {
  Safe: "text-success border-success/30 bg-success/5",
  "Low Risk": "text-success border-success/30 bg-success/5",
  "Medium Risk": "text-warning border-warning/30 bg-warning/5",
  "High Risk": "text-orange-400 border-orange-400/30 bg-orange-400/5",
  "Critical Risk": "text-destructive border-destructive/30 bg-destructive/5",
};

const AdvancedRiskScoring = ({
  riskScore,
  riskCategory,
  confidenceScore,
  fraudLikelihood,
  severityLevel,
}: AdvancedRiskScoringProps) => {
  const metrics = [
    { icon: Gauge, label: "Threat Score", value: `${riskScore}/100` },
    { icon: Activity, label: "Confidence", value: confidenceScore !== undefined ? `${confidenceScore}%` : "—" },
    { icon: TrendingUp, label: "Fraud Likelihood", value: fraudLikelihood !== undefined ? `${fraudLikelihood}%` : "—" },
    { icon: ShieldAlert, label: "Severity", value: severityLevel || "—" },
  ];

  return (
    <div className="glass-card rounded-xl border border-border/30 p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="font-semibold text-foreground text-sm">Advanced Risk Assessment</span>
        {riskCategory && (
          <span
            className={cn(
              "text-[11px] font-semibold px-2.5 py-1 rounded-full border",
              categoryColor[riskCategory] || categoryColor["Medium Risk"]
            )}
          >
            {riskCategory}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="rounded-lg border border-border/30 bg-muted/20 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</span>
              </div>
              <p className="text-lg font-bold font-mono text-foreground">{m.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedRiskScoring;
