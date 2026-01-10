import { AlertTriangle, ShieldAlert, ShieldCheck, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type RiskLevel = "Low" | "Medium" | "High" | "Inconclusive";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: "sm" | "md" | "lg";
}

const riskConfig = {
  Low: {
    icon: ShieldCheck,
    bgClass: "bg-success/10 border-success/30",
    textClass: "risk-low",
    label: "Low Risk",
  },
  Medium: {
    icon: AlertTriangle,
    bgClass: "bg-warning/10 border-warning/30",
    textClass: "risk-medium",
    label: "Medium Risk",
  },
  High: {
    icon: ShieldAlert,
    bgClass: "bg-destructive/10 border-destructive/30",
    textClass: "risk-high",
    label: "High Risk",
  },
  Inconclusive: {
    icon: HelpCircle,
    bgClass: "bg-muted/50 border-muted-foreground/30",
    textClass: "text-muted-foreground",
    label: "Inconclusive",
  },
};

const sizeConfig = {
  sm: { padding: "px-3 py-1.5", text: "text-sm", icon: 16 },
  md: { padding: "px-4 py-2", text: "text-base", icon: 20 },
  lg: { padding: "px-6 py-3", text: "text-lg", icon: 24 },
};

const RiskBadge = ({ level, score, size = "md" }: RiskBadgeProps) => {
  const config = riskConfig[level];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-semibold",
        config.bgClass,
        sizeStyles.padding,
        sizeStyles.text
      )}
    >
      <Icon size={sizeStyles.icon} className={config.textClass} />
      <span className={config.textClass}>{config.label}</span>
      {score !== undefined && (
        <span className={cn("font-mono ml-1", config.textClass)}>
          {score}/100
        </span>
      )}
    </div>
  );
};

export default RiskBadge;
