import { Brain, ChevronDown, ChevronUp, Lightbulb, ShieldAlert, CheckCircle, ListChecks, Link, User, ImageIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import EvidenceItem from "./EvidenceItem";
import AIImageAnalysis from "./AIImageAnalysis";
import type { AnalysisResultData } from "./AnalysisResult";

interface AIExplanationPanelProps {
  data: AnalysisResultData;
}

const AIExplanationPanel = ({ data }: AIExplanationPanelProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    explanation: true,
    evidence: true,
    deepfake: true,
    links: true,
    safe: false,
    actions: false,
  });

  const toggle = (key: string) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const hasDeepfake =
    data.deepfake_analysis?.contains_person ||
    (data.deepfake_analysis?.is_deepfake !== null && data.deepfake_analysis?.is_deepfake !== undefined);
  const hasLinks =
    data.link_analysis &&
    (data.link_analysis.urls_found.length > 0 || data.link_analysis.suspicious_urls.length > 0);
  const hasAIImage = data.ai_image_analysis?.is_ai_generated !== null && data.ai_image_analysis?.is_ai_generated !== undefined;

  return (
    <div className="space-y-3">
      {/* AI Image Analysis - Show prominently at top when image was analyzed */}
      {hasAIImage && data.ai_image_analysis && (
        <AIImageAnalysis data={data.ai_image_analysis} />
      )}

      {/* Why This Is Risky */}
      <Section
        icon={<Brain className="w-4 h-4 text-warning" />}
        title="AI Threat Explanation"
        tag="WHY"
        tagColor="bg-warning/20 text-warning border-warning/30"
        expanded={expandedSections.explanation}
        onToggle={() => toggle("explanation")}
      >
        <p className="text-sm text-foreground/90 leading-relaxed">{data.explanation}</p>
        {data.manipulation_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {data.manipulation_tags.map((tag, i) => (
              <Badge
                key={i}
                variant="outline"
                className="border-destructive/30 text-destructive bg-destructive/5 text-[11px]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </Section>

      {/* Evidence */}
      <Section
        icon={<ShieldAlert className="w-4 h-4 text-primary" />}
        title="Evidence & Signals"
        tag={`${data.evidence.length} signals`}
        tagColor="bg-primary/20 text-primary border-primary/30"
        expanded={expandedSections.evidence}
        onToggle={() => toggle("evidence")}
      >
        <div className="space-y-2">
          {data.evidence.map((ev, i) => (
            <EvidenceItem key={i} evidence={ev} />
          ))}
        </div>
      </Section>

      {/* Deepfake Section */}
      {hasDeepfake && data.deepfake_analysis && (
        <Section
          icon={<User className="w-4 h-4" />}
          title="Deepfake Detection"
          tag={data.deepfake_analysis.is_deepfake ? "DETECTED" : "AUTHENTIC"}
          tagColor={
            data.deepfake_analysis.is_deepfake
              ? "bg-destructive/20 text-destructive border-destructive/30"
              : "bg-success/20 text-success border-success/30"
          }
          expanded={expandedSections.deepfake}
          onToggle={() => toggle("deepfake")}
          borderColor={data.deepfake_analysis.is_deepfake ? "border-destructive/30" : "border-success/30"}
        >
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div
              className={cn(
                "p-3 rounded-lg border",
                data.deepfake_analysis.is_deepfake
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-success/5 border-success/20"
              )}
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Result</p>
              <p
                className={cn(
                  "font-bold text-sm",
                  data.deepfake_analysis.is_deepfake ? "text-destructive" : "text-success"
                )}
              >
                {data.deepfake_analysis.is_deepfake ? "⚠️ DEEPFAKE" : "✅ AUTHENTIC"}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-border/30 bg-muted/20">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Confidence</p>
              <p className="font-bold text-sm font-mono text-foreground">
                {data.deepfake_analysis.deepfake_confidence}%
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground/80">{data.deepfake_analysis.person_assessment}</p>
          {data.deepfake_analysis.artifacts_found?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {data.deepfake_analysis.artifacts_found.map((a, i) => (
                <Badge key={i} variant="outline" className="border-warning/30 text-warning bg-warning/5 text-[11px]">
                  {a}
                </Badge>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Link Analysis */}
      {hasLinks && data.link_analysis && (
        <Section
          icon={<Link className="w-4 h-4 text-warning" />}
          title="Link Analysis"
          tag={`${data.link_analysis.suspicious_urls.length} suspicious`}
          tagColor={
            data.link_analysis.suspicious_urls.length > 0
              ? "bg-warning/20 text-warning border-warning/30"
              : "bg-success/20 text-success border-success/30"
          }
          expanded={expandedSections.links}
          onToggle={() => toggle("links")}
        >
          {data.link_analysis.urls_found.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                URLs Found ({data.link_analysis.urls_found.length})
              </p>
              <div className="space-y-1.5">
                {data.link_analysis.urls_found.map((url, i) => (
                  <div
                    key={i}
                    className="bg-muted/30 rounded-md p-2 text-xs font-mono text-foreground/70 break-all border border-border/30"
                  >
                    {url}
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.link_analysis.suspicious_urls.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-destructive mb-2 font-medium">
                ⚠️ Suspicious URLs
              </p>
              <div className="space-y-1.5">
                {data.link_analysis.suspicious_urls.map((url, i) => (
                  <div
                    key={i}
                    className="bg-destructive/5 rounded-md p-2 text-xs text-destructive border border-destructive/20 break-all"
                  >
                    {url}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            {data.link_analysis.brand_impersonation && (
              <Badge variant="destructive" className="text-[11px]">Brand Impersonation</Badge>
            )}
            {data.link_analysis.typosquatting_detected && (
              <Badge variant="destructive" className="text-[11px]">Typosquatting</Badge>
            )}
          </div>
        </Section>
      )}

      {/* Safe Rewrite */}
      <Section
        icon={<CheckCircle className="w-4 h-4 text-success" />}
        title="Recommended Safe Response"
        expanded={expandedSections.safe}
        onToggle={() => toggle("safe")}
      >
        <div className="bg-success/5 border border-success/20 rounded-lg p-3">
          <p className="text-sm text-foreground/90 italic">"{data.safe_rewrite}"</p>
        </div>
      </Section>

      {/* Next Actions */}
      <Section
        icon={<ListChecks className="w-4 h-4 text-primary" />}
        title="Recommended Actions"
        expanded={expandedSections.actions}
        onToggle={() => toggle("actions")}
      >
        <ol className="space-y-2">
          {data.next_actions.map((action, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-foreground/80">{action}</span>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
};

/* Collapsible Section component */
function Section({
  icon,
  title,
  tag,
  tagColor,
  expanded,
  onToggle,
  borderColor,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  tag?: string;
  tagColor?: string;
  expanded: boolean;
  onToggle: () => void;
  borderColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("glass-card rounded-xl border overflow-hidden", borderColor || "border-border/30")}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 p-4 hover:bg-muted/20 transition-colors text-left"
      >
        {icon}
        <span className="flex-1 font-semibold text-foreground text-sm">{title}</span>
        {tag && (
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", tagColor)}>
            {tag}
          </span>
        )}
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default AIExplanationPanel;
