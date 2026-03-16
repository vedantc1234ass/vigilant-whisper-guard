import { Shield, AlertTriangle, ShieldCheck, Activity, TrendingUp, Eye, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisResultData } from "./AnalysisResult";

interface ThreatDashboardProps {
  history: AnalysisResultData[];
}

const ThreatDashboard = ({ history }: ThreatDashboardProps) => {
  const totalScans = history.length;
  const highThreats = history.filter((r) => r.risk_label === "High").length;
  const mediumThreats = history.filter((r) => r.risk_label === "Medium").length;
  const lowThreats = history.filter((r) => r.risk_label === "Low").length;
  const avgScore = totalScans > 0 ? Math.round(history.reduce((s, r) => s + r.risk_score, 0) / totalScans) : 0;
  const deepfakesDetected = history.filter((r) => r.deepfake_analysis?.is_deepfake).length;
  const suspiciousLinks = history.reduce((s, r) => s + (r.link_analysis?.suspicious_urls?.length || 0), 0);

  const stats = [
    {
      label: "Total Scans",
      value: totalScans,
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
    },
    {
      label: "High Threats",
      value: highThreats,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10 border-destructive/20",
    },
    {
      label: "Deepfakes Found",
      value: deepfakesDetected,
      icon: Eye,
      color: "text-warning",
      bgColor: "bg-warning/10 border-warning/20",
    },
    {
      label: "Suspicious Links",
      value: suspiciousLinks,
      icon: Zap,
      color: "text-destructive",
      bgColor: "bg-destructive/10 border-destructive/20",
    },
  ];

  const recentThreats = [...history].reverse().slice(0, 5);

  return (
    <div className="space-y-6 fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "glass-card rounded-xl p-4 border",
              stat.bgColor
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <p className={cn("text-2xl font-bold font-mono", stat.color)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Average Risk Score */}
      <div className="glass-card rounded-xl p-5 border border-border/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Average Risk Score</h3>
          </div>
          <span className={cn(
            "text-xl font-bold font-mono",
            avgScore >= 70 ? "text-destructive" : avgScore >= 40 ? "text-warning" : "text-success"
          )}>
            {avgScore}/100
          </span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              avgScore >= 70
                ? "bg-gradient-to-r from-destructive/80 to-destructive"
                : avgScore >= 40
                ? "bg-gradient-to-r from-warning/80 to-warning"
                : "bg-gradient-to-r from-success/80 to-success"
            )}
            style={{ width: `${avgScore}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground font-mono">
          <span>0 (Safe)</span>
          <span>50</span>
          <span>100 (Critical)</span>
        </div>
      </div>

      {/* Threat Distribution */}
      {totalScans > 0 && (
        <div className="glass-card rounded-xl p-5 border border-border/30">
          <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Threat Distribution
          </h3>
          <div className="flex gap-2 items-end h-20">
            {[
              { label: "Low", count: lowThreats, color: "bg-success" },
              { label: "Medium", count: mediumThreats, color: "bg-warning" },
              { label: "High", count: highThreats, color: "bg-destructive" },
            ].map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-mono text-muted-foreground">{bar.count}</span>
                <div
                  className={cn("w-full rounded-t-md transition-all duration-700", bar.color)}
                  style={{
                    height: totalScans > 0 ? `${Math.max((bar.count / totalScans) * 100, 8)}%` : "8%",
                  }}
                />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentThreats.length > 0 && (
        <div className="glass-card rounded-xl p-5 border border-border/30">
          <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Recent Scans
          </h3>
          <div className="space-y-2">
            {recentThreats.map((threat, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/30"
              >
                {threat.risk_label === "High" ? (
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                ) : threat.risk_label === "Medium" ? (
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">
                    {threat.meta.channel} • {threat.manipulation_tags.slice(0, 2).join(", ") || "No tags"}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-xs font-mono font-bold px-2 py-0.5 rounded-full",
                    threat.risk_label === "High"
                      ? "bg-destructive/20 text-destructive"
                      : threat.risk_label === "Medium"
                      ? "bg-warning/20 text-warning"
                      : "bg-success/20 text-success"
                  )}
                >
                  {threat.risk_score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatDashboard;
