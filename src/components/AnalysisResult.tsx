import { CheckCircle, AlertCircle, Shield, Sparkles, ListChecks } from "lucide-react";
import RiskBadge from "./RiskBadge";
import EvidenceItem from "./EvidenceItem";
import { Badge } from "./ui/badge";

interface AnalysisResultData {
  product: string;
  used_services: string[];
  risk_label: "Low" | "Medium" | "High" | "Inconclusive";
  risk_score: number;
  manipulation_tags: string[];
  explanation: string;
  safe_rewrite: string;
  next_actions: string[];
  evidence: Array<{
    source: "text" | "vision" | "speech" | "ml";
    reason: string;
    confidence: number;
  }>;
  meta: {
    channel: string;
    sender_name: string | null;
    timestamp: string | null;
  };
}

interface AnalysisResultProps {
  data: AnalysisResultData;
}

const AnalysisResult = ({ data }: AnalysisResultProps) => {
  return (
    <div className="space-y-6 fade-in">
      {/* Header with Risk Badge */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-foreground">{data.product} Analysis</h2>
              <p className="text-sm text-muted-foreground">
                Channel: {data.meta.channel} • {data.meta.sender_name || "Unknown sender"}
              </p>
            </div>
          </div>
          <RiskBadge level={data.risk_label} score={data.risk_score} size="lg" />
        </div>

        {/* Manipulation Tags */}
        {data.manipulation_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {data.manipulation_tags.map((tag, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="border-destructive/30 text-destructive bg-destructive/5"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* AI Services Used */}
        <div className="flex flex-wrap gap-2">
          {data.used_services.map((service, i) => (
            <Badge 
              key={i} 
              variant="secondary" 
              className="bg-primary/10 text-primary border-primary/20"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {service}
            </Badge>
          ))}
        </div>
      </div>

      {/* Explanation Section */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">
            🧠 Explanation (Why this is risky)
          </h3>
        </div>
        <p className="text-foreground/90 leading-relaxed">{data.explanation}</p>
      </div>

      {/* Safe Rewrite Section */}
      <div className="glass-card rounded-2xl p-6 border-success/20">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-success" />
          <h3 className="text-lg font-semibold text-foreground">
            ✅ Recommended Safe Response
          </h3>
        </div>
        <div className="bg-success/5 border border-success/20 rounded-xl p-4">
          <p className="text-foreground/90 italic">"{data.safe_rewrite}"</p>
        </div>
      </div>

      {/* Next Actions */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Recommended Actions
          </h3>
        </div>
        <ul className="space-y-3">
          {data.next_actions.map((action, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-foreground/90">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Evidence Section */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Evidence & Signals
        </h3>
        <div className="space-y-3">
          {data.evidence.map((ev, i) => (
            <EvidenceItem key={i} evidence={ev} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
export type { AnalysisResultData };
