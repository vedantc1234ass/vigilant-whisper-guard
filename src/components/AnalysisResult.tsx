import { CheckCircle, AlertCircle, Shield, Sparkles, ListChecks, User, Link, Video, Mic } from "lucide-react";
import RiskBadge from "./RiskBadge";
import EvidenceItem from "./EvidenceItem";
import { Badge } from "./ui/badge";

interface DeepfakeAnalysis {
  contains_person: boolean;
  is_deepfake: boolean | null;
  deepfake_confidence: number;
  deepfake_type: string | null;
  artifacts_found: string[];
  person_assessment: string;
}

interface LinkAnalysis {
  urls_found: string[];
  suspicious_urls: (string | { url: string; reason?: string; severity?: string })[];
  brand_impersonation: boolean;
  typosquatting_detected: boolean;
}

interface AIImageAnalysisResult {
  is_ai_generated: "ai_generated" | "likely_ai" | "likely_real" | "real" | "manipulated" | null;
  ai_confidence: number;
  ai_generator_suspected: string | null;
  artifacts_found: string[];
  assessment: string;
}

interface FoundryIntelligence {
  knowledge_sources_retrieved: string[];
  threat_intelligence_matched: string[];
  security_patterns_found: string[];
}

interface ReasoningStep {
  step: number;
  title: string;
  finding: string;
  status: "clear" | "flagged" | "info";
}

interface SecurityIndicator {
  indicator: string;
  confidence: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  reason: string;
}

interface AnalysisResultData {
  product: string;
  used_services: string[];
  risk_label: "Low" | "Medium" | "High" | "Inconclusive";
  risk_score: number;
  risk_category?: "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk";
  confidence_score?: number;
  fraud_likelihood?: number;
  severity_level?: "None" | "Low" | "Medium" | "High" | "Critical";
  manipulation_tags: string[];
  explanation: string;
  safe_rewrite: string;
  next_actions: string[];
  foundry_intelligence?: FoundryIntelligence;
  reasoning_steps?: ReasoningStep[];
  security_indicators?: SecurityIndicator[];
  evidence: Array<{
    source: "text" | "vision" | "speech" | "ml" | "link";
    reason: string;
    confidence: number;
  }>;
  ai_image_analysis?: AIImageAnalysisResult;
  deepfake_analysis?: DeepfakeAnalysis;
  link_analysis?: LinkAnalysis;
  meta: {
    channel: string;
    sender_name: string | null;
    timestamp: string | null;
    media_analyzed?: string[];
  };
}

interface AnalysisResultProps {
  data: AnalysisResultData;
}

const AnalysisResult = ({ data }: AnalysisResultProps) => {
  const hasDeepfakeAnalysis = data.deepfake_analysis?.contains_person || 
    (data.deepfake_analysis?.is_deepfake !== null && data.deepfake_analysis?.is_deepfake !== undefined);
  
  const hasLinkAnalysis = data.link_analysis && 
    (data.link_analysis.urls_found.length > 0 || data.link_analysis.suspicious_urls.length > 0);

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

        {/* Media Analyzed Tags */}
        {data.meta.media_analyzed && data.meta.media_analyzed.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {data.meta.media_analyzed.map((media, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="border-cyan-400/30 text-cyan-400 bg-cyan-400/5"
              >
                {media === 'image' && <User className="w-3 h-3 mr-1" />}
                {media === 'video' && <Video className="w-3 h-3 mr-1" />}
                {media === 'audio' && <Mic className="w-3 h-3 mr-1" />}
                {media} analyzed
              </Badge>
            ))}
          </div>
        )}

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

      {/* Deepfake Analysis Section */}
      {hasDeepfakeAnalysis && data.deepfake_analysis && (
        <div className={`glass-card rounded-2xl p-6 ${
          data.deepfake_analysis.is_deepfake 
            ? 'border-2 border-destructive/50 bg-destructive/5' 
            : 'border-2 border-success/50 bg-success/5'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <User className={`w-5 h-5 ${data.deepfake_analysis.is_deepfake ? 'text-destructive' : 'text-success'}`} />
            <h3 className="text-lg font-semibold text-foreground">
              🎭 Deepfake Detection Result
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className={`p-4 rounded-xl ${
              data.deepfake_analysis.is_deepfake 
                ? 'bg-destructive/10 border border-destructive/30' 
                : 'bg-success/10 border border-success/30'
            }`}>
              <p className="text-sm text-muted-foreground mb-1">Person Detection</p>
              <p className={`text-2xl font-bold ${
                data.deepfake_analysis.is_deepfake ? 'text-destructive' : 'text-success'
              }`}>
                {data.deepfake_analysis.is_deepfake ? '⚠️ DEEPFAKE DETECTED' : '✅ APPEARS AUTHENTIC'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Confidence: {data.deepfake_analysis.deepfake_confidence}%
              </p>
            </div>
            
            {data.deepfake_analysis.deepfake_type && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Deepfake Type</p>
                <p className="text-lg font-semibold text-foreground capitalize">
                  {data.deepfake_analysis.deepfake_type.replace(/_/g, ' ')}
                </p>
              </div>
            )}
          </div>

          <div className="bg-background/50 rounded-xl p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-1">Assessment</p>
            <p className="text-foreground">{data.deepfake_analysis.person_assessment}</p>
          </div>

          {data.deepfake_analysis.artifacts_found && data.deepfake_analysis.artifacts_found.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Artifacts Detected:</p>
              <div className="flex flex-wrap gap-2">
                {data.deepfake_analysis.artifacts_found.map((artifact, i) => (
                  <Badge key={i} variant="outline" className="border-warning/30 text-warning bg-warning/5">
                    {artifact}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Link Analysis Section */}
      {hasLinkAnalysis && data.link_analysis && (
        <div className={`glass-card rounded-2xl p-6 ${
          data.link_analysis.suspicious_urls.length > 0 
            ? 'border-2 border-warning/50 bg-warning/5' 
            : 'border-2 border-success/50 bg-success/5'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Link className={`w-5 h-5 ${
              data.link_analysis.suspicious_urls.length > 0 ? 'text-warning' : 'text-success'
            }`} />
            <h3 className="text-lg font-semibold text-foreground">
              🔗 Link Analysis
            </h3>
          </div>

          <div className="space-y-4">
            {data.link_analysis.urls_found.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">URLs Found ({data.link_analysis.urls_found.length}):</p>
                <div className="space-y-2">
                  {data.link_analysis.urls_found.map((url, i) => (
                    <div key={i} className="bg-background/50 rounded-lg p-2 text-sm font-mono text-foreground/80 break-all">
                      {url}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.link_analysis.suspicious_urls.length > 0 && (
              <div>
                <p className="text-sm text-destructive font-semibold mb-2">⚠️ Suspicious URLs:</p>
                <div className="space-y-2">
                  {data.link_analysis.suspicious_urls.map((item, i) => {
                    const url = typeof item === "string" ? item : (item as any)?.url;
                    const reason = typeof item === "string" ? null : (item as any)?.reason;
                    return (
                      <div key={i} className="bg-destructive/10 border border-destructive/30 rounded-lg p-2 text-sm text-destructive break-all">
                        {url}
                        {reason && <span className="block text-xs text-destructive/70 mt-1">{reason}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {data.link_analysis.brand_impersonation && (
                <Badge variant="destructive">Brand Impersonation Detected</Badge>
              )}
              {data.link_analysis.typosquatting_detected && (
                <Badge variant="destructive">Typosquatting Detected</Badge>
              )}
            </div>
          </div>
        </div>
      )}

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