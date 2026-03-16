import { ImageIcon, Sparkles, Camera, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface AIImageAnalysisData {
  is_ai_generated: "ai_generated" | "likely_ai" | "likely_real" | "real" | "manipulated" | null;
  ai_confidence: number;
  ai_generator_suspected: string | null;
  artifacts_found: string[];
  assessment: string;
}

interface AIImageAnalysisProps {
  data: AIImageAnalysisData;
}

const verdictConfig = {
  ai_generated: {
    icon: Sparkles,
    label: "AI-Generated",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30",
    badge: "bg-destructive/20 text-destructive border-destructive/30",
    description: "This image was created by AI",
  },
  likely_ai: {
    icon: AlertTriangle,
    label: "Likely AI-Generated",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/30",
    badge: "bg-warning/20 text-warning border-warning/30",
    description: "Strong signs of AI generation detected",
  },
  likely_real: {
    icon: HelpCircle,
    label: "Likely Real",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
    badge: "bg-primary/20 text-primary border-primary/30",
    description: "Appears authentic with minor anomalies",
  },
  real: {
    icon: CheckCircle,
    label: "Real Photograph",
    color: "text-success",
    bg: "bg-success/10 border-success/30",
    badge: "bg-success/20 text-success border-success/30",
    description: "This image is a genuine photograph",
  },
  manipulated: {
    icon: AlertTriangle,
    label: "Manipulated",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/30",
    badge: "bg-warning/20 text-warning border-warning/30",
    description: "Real image that has been edited or doctored",
  },
};

const generatorLabels: Record<string, string> = {
  stable_diffusion: "Stable Diffusion",
  dall_e: "DALL·E",
  midjourney: "Midjourney",
  gan: "GAN",
  unknown: "Unknown AI",
};

const AIImageAnalysis = ({ data }: AIImageAnalysisProps) => {
  if (!data.is_ai_generated) return null;

  const config = verdictConfig[data.is_ai_generated];
  const Icon = config.icon;
  const isAI = data.is_ai_generated === "ai_generated" || data.is_ai_generated === "likely_ai";

  return (
    <div className={cn("glass-card rounded-xl border-2 overflow-hidden", config.bg)}>
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2.5 mb-3">
          <div className={cn("p-2 rounded-lg", isAI ? "bg-destructive/20" : "bg-success/20")}>
            <ImageIcon className={cn("w-5 h-5", config.color)} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              Image Authenticity Check
            </h3>
            <p className="text-[11px] text-muted-foreground">Powered by Azure AI Vision</p>
          </div>
        </div>

        {/* Verdict Banner */}
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg border",
          config.bg
        )}>
          <Icon className={cn("w-6 h-6 flex-shrink-0", config.color)} />
          <div className="flex-1">
            <p className={cn("font-bold text-base", config.color)}>
              {isAI ? "🤖 " : "📸 "}{config.label}
            </p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
          <div className="text-right">
            <p className={cn("text-lg font-bold font-mono", config.color)}>
              {data.ai_confidence}%
            </p>
            <p className="text-[10px] text-muted-foreground">confidence</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 pb-4 space-y-3">
        {/* Generator */}
        {data.ai_generator_suspected && data.ai_generator_suspected !== "none" && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Suspected Generator:</span>
            <Badge variant="outline" className={cn("text-[11px]", config.badge)}>
              <Sparkles className="w-3 h-3 mr-1" />
              {generatorLabels[data.ai_generator_suspected] || data.ai_generator_suspected}
            </Badge>
          </div>
        )}

        {/* Assessment */}
        <div className="bg-background/50 rounded-lg p-3 border border-border/30">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">AI Assessment</p>
          <p className="text-sm text-foreground/90 leading-relaxed">{data.assessment}</p>
        </div>

        {/* Artifacts */}
        {data.artifacts_found && data.artifacts_found.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Detected Artifacts ({data.artifacts_found.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.artifacts_found.map((artifact, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="border-warning/30 text-warning bg-warning/5 text-[11px]"
                >
                  {artifact}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIImageAnalysis;
export type { AIImageAnalysisData };
