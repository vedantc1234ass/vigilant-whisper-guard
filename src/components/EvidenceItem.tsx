import { Brain, Eye, AudioLines, Cpu, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Evidence {
  source: "text" | "vision" | "speech" | "ml";
  reason: string;
  confidence: number;
}

interface EvidenceItemProps {
  evidence: Evidence;
}

const sourceConfig = {
  text: { icon: MessageSquare, label: "Text Analysis", color: "text-primary" },
  vision: { icon: Eye, label: "Vision AI", color: "text-cyan-400" },
  speech: { icon: AudioLines, label: "Speech AI", color: "text-violet-400" },
  ml: { icon: Cpu, label: "ML Scoring", color: "text-emerald-400" },
};

const EvidenceItem = ({ evidence }: EvidenceItemProps) => {
  const config = sourceConfig[evidence.source];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className={cn("p-2 rounded-lg bg-background/50", config.color)}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-sm font-medium", config.color)}>
            {config.label}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            {evidence.confidence}% confidence
          </span>
        </div>
        <p className="text-sm text-foreground/80">{evidence.reason}</p>
      </div>
    </div>
  );
};

export default EvidenceItem;
