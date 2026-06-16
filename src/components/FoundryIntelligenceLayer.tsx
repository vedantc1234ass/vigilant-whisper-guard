import { Database, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";

interface FoundryIntelligence {
  knowledge_sources_retrieved: string[];
  threat_intelligence_matched: string[];
  security_patterns_found: string[];
}

const FoundryIntelligenceLayer = ({ data }: { data: FoundryIntelligence }) => {
  if (!data) return null;

  const blocks = [
    {
      icon: Database,
      title: "Knowledge Sources Retrieved",
      items: data.knowledge_sources_retrieved || [],
      accent: "border-cyan-400/30 text-cyan-400 bg-cyan-400/5",
    },
    {
      icon: Search,
      title: "Threat Intelligence Matched",
      items: data.threat_intelligence_matched || [],
      accent: "border-violet-400/30 text-violet-400 bg-violet-400/5",
    },
    {
      icon: ShieldCheck,
      title: "Security Patterns Found",
      items: data.security_patterns_found || [],
      accent: "border-emerald-400/30 text-emerald-400 bg-emerald-400/5",
    },
  ];

  return (
    <div className="glass-card rounded-xl border border-cyan-400/20 p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span className="font-semibold text-foreground text-sm">Foundry Intelligence Layer</span>
        <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-400">
          GROUNDED RETRIEVAL
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Evidence-based agentic reasoning grounded in retrieved cybersecurity intelligence.
      </p>

      <div className="grid md:grid-cols-3 gap-3">
        {blocks.map((b, i) => {
          const Icon = b.icon;
          return (
            <div key={i} className="rounded-lg border border-border/30 bg-muted/20 p-3">
              <div className="flex items-center gap-2 mb-2.5">
                <Icon className="w-3.5 h-3.5 text-foreground/70" />
                <span className="text-[11px] font-medium text-foreground/80">{b.title}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {b.items.length > 0 ? (
                  b.items.map((item, j) => (
                    <Badge key={j} variant="outline" className={`text-[10px] ${b.accent}`}>
                      {item}
                    </Badge>
                  ))
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">No matches</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FoundryIntelligenceLayer;
