import { cn } from "@/lib/utils";

interface RiskScoreGaugeProps {
  score: number;
  label: "Low" | "Medium" | "High" | "Inconclusive";
  size?: "sm" | "lg";
}

const RiskScoreGauge = ({ score, label, size = "lg" }: RiskScoreGaugeProps) => {
  const isLg = size === "lg";
  const radius = isLg ? 54 : 36;
  const stroke = isLg ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const svgSize = (radius + stroke) * 2;

  const color =
    label === "High"
      ? "hsl(var(--destructive))"
      : label === "Medium"
      ? "hsl(var(--warning))"
      : label === "Low"
      ? "hsl(var(--success))"
      : "hsl(var(--muted-foreground))";

  const glowColor =
    label === "High"
      ? "hsla(0,84%,60%,0.4)"
      : label === "Medium"
      ? "hsla(32,95%,55%,0.4)"
      : label === "Low"
      ? "hsla(120,60%,50%,0.4)"
      : "transparent";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
          />
          {/* Progress circle */}
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-mono font-bold",
              isLg ? "text-3xl" : "text-lg"
            )}
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>
      <span
        className={cn(
          "font-semibold uppercase tracking-wider",
          isLg ? "text-sm" : "text-xs",
          label === "High" && "text-destructive",
          label === "Medium" && "text-warning",
          label === "Low" && "text-success",
          label === "Inconclusive" && "text-muted-foreground"
        )}
      >
        {label} Risk
      </span>
    </div>
  );
};

export default RiskScoreGauge;
