import { Scan, Brain, Eye, AudioLines, Cpu } from "lucide-react";
import Logo from "./Logo";

interface LoadingStateProps {
  stage?: "scanning" | "analyzing" | "processing";
}

const LoadingState = ({ stage = "scanning" }: LoadingStateProps) => {
  const stages = [
    { icon: Scan, label: "Scanning content...", active: stage === "scanning" },
    { icon: Brain, label: "Azure OpenAI Analysis", active: stage === "analyzing" },
    { icon: Cpu, label: "ML Risk Scoring", active: stage === "processing" },
  ];

  return (
    <div className="glass-card rounded-2xl p-8 text-center fade-in">
      <div className="flex justify-center mb-6">
        <Logo size={64} showText={false} interactive={false} className="shield-animated" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        🔍 AI Analysis in Progress...
      </h3>
      <p className="text-muted-foreground mb-8">
        Scanning for phishing patterns, deepfakes, and manipulation signals
      </p>

      <div className="flex justify-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-primary/70">
          <Eye size={18} />
          <span className="text-sm">Vision</span>
        </div>
        <div className="flex items-center gap-2 text-primary/70">
          <AudioLines size={18} />
          <span className="text-sm">Speech</span>
        </div>
        <div className="flex items-center gap-2 text-primary/70">
          <Brain size={18} />
          <span className="text-sm">OpenAI</span>
        </div>
        <div className="flex items-center gap-2 text-primary/70">
          <Cpu size={18} />
          <span className="text-sm">ML</span>
        </div>
      </div>

      <div className="space-y-3">
        {stages.map((s, i) => (
          <div 
            key={i}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
              s.active 
                ? 'bg-primary/10 border border-primary/30' 
                : 'bg-muted/30 opacity-50'
            }`}
          >
            <s.icon size={18} className={s.active ? 'text-primary' : 'text-muted-foreground'} />
            <span className={s.active ? 'text-foreground' : 'text-muted-foreground'}>
              {s.label}
            </span>
            {s.active && (
              <div className="ml-auto flex gap-1">
                <div className="loading-dot w-2 h-2 bg-primary rounded-full" />
                <div className="loading-dot w-2 h-2 bg-primary rounded-full" />
                <div className="loading-dot w-2 h-2 bg-primary rounded-full" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
