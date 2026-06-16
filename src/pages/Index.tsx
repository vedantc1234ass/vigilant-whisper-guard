import { useState } from "react";
import Header from "@/components/Header";
import AnalyzerForm from "@/components/AnalyzerForm";
import LoadingState from "@/components/LoadingState";
import RiskScoreGauge from "@/components/RiskScoreGauge";
import AIExplanationPanel from "@/components/AIExplanationPanel";
import ReasoningWorkflow from "@/components/ReasoningWorkflow";
import FoundryIntelligenceLayer from "@/components/FoundryIntelligenceLayer";
import SecurityEvidencePanel from "@/components/SecurityEvidencePanel";
import AdvancedRiskScoring from "@/components/AdvancedRiskScoring";
import ThreatDashboard from "@/components/ThreatDashboard";
import ShieldIcon from "@/components/ShieldIcon";
import Logo from "@/components/Logo";
import ChatBot from "@/components/ChatBot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Zap, Eye, ArrowLeft, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AnalysisResultData } from "@/components/AnalysisResult";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const [history, setHistory] = useState<AnalysisResultData[]>([]);
  const [loadingStage, setLoadingStage] = useState<"scanning" | "analyzing" | "processing">("scanning");
  const [view, setView] = useState<"analyzer" | "dashboard">("analyzer");
  const { toast } = useToast();

  const handleAnalyze = async (data: { text: string; channel: string; file: File | null }) => {
    setIsLoading(true);
    setResult(null);
    setLoadingStage("scanning");

    try {
      const hasImage = data.file?.type.startsWith('image/') || false;
      const hasAudio = data.file?.type.startsWith('audio/') || false;
      const hasVideo = data.file?.type.startsWith('video/') || false;

      let imageBase64: string | null = null;
      let audioBase64: string | null = null;
      let videoBase64: string | null = null;

      if (data.file) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(data.file!);
        });
        if (hasImage) imageBase64 = base64;
        if (hasAudio) audioBase64 = base64;
        if (hasVideo) videoBase64 = base64;
      }

      setTimeout(() => setLoadingStage("analyzing"), 800);
      setTimeout(() => setLoadingStage("processing"), 2000);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-threat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: data.text,
          channel: data.channel,
          hasImage,
          hasAudio,
          hasVideo,
          imageBase64,
          audioBase64,
          videoBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast({ variant: "destructive", title: "Rate Limited", description: "Too many requests. Please wait a moment and try again." });
        } else if (response.status === 402) {
          toast({ variant: "destructive", title: "Usage Limit", description: "AI usage limit reached. Please add credits to continue." });
        } else {
          throw new Error(errorData.error || "Analysis failed");
        }
        setIsLoading(false);
        return;
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
      setHistory((prev) => [...prev, analysisResult]);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => setResult(null);

  return (
    <div className="min-h-screen cyber-bg circuit-pattern">
      <Header />

      <main className="container mx-auto px-4 pt-20 pb-16">
        {/* Top Bar with View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {result && (
              <Button variant="cyber-ghost" size="sm" onClick={handleReset}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                New Scan
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "analyzer" ? "cyber-outline" : "cyber-ghost"}
              size="sm"
              onClick={() => { setView("analyzer"); setResult(null); }}
            >
              <Shield className="w-4 h-4 mr-1" />
              Analyzer
            </Button>
            <Button
              variant={view === "dashboard" ? "cyber-outline" : "cyber-ghost"}
              size="sm"
              onClick={() => setView("dashboard")}
            >
              <LayoutDashboard className="w-4 h-4 mr-1" />
              Dashboard
              {history.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-mono">
                  {history.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Dashboard View */}
        {view === "dashboard" && (
          <div className="max-w-4xl mx-auto">
            {history.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <LayoutDashboard className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Scans Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Run your first threat analysis to populate the dashboard.
                </p>
                <Button variant="cyber" onClick={() => setView("analyzer")}>
                  Start Scanning
                </Button>
              </div>
            ) : (
              <ThreatDashboard history={history} />
            )}
          </div>
        )}

        {/* Analyzer View */}
        {view === "analyzer" && (
          <>
            {/* Hero */}
            {!result && !isLoading && (
              <div className="text-center mb-10 fade-in">
                <div className="flex justify-center mb-5">
                  <Logo size={72} showText={false} className="shield-animated" />
                </div>
                <p className="text-xs font-semibold tracking-[0.3em] text-cyan-400 uppercase mb-2">
                  GenStar · CyberShield AI Agent
                </p>
                <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
                  AI-Powered Defense Against Digital Threats
                </h1>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-5">
                  An agentic cybersecurity reasoning agent that detects phishing, scams, suspicious links,
                  deepfakes, synthetic voices, and manipulated media — with grounded, explainable AI reasoning.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" /> Agentic AI
                  </Badge>
                  <Badge variant="outline" className="border-cyan-400/30 text-cyan-400 bg-cyan-400/5 px-3 py-1">
                    <Eye className="w-3 h-3 mr-1" /> Foundry IQ
                  </Badge>
                  <Badge variant="outline" className="border-violet-400/30 text-violet-400 bg-violet-400/5 px-3 py-1">
                    <Zap className="w-3 h-3 mr-1" /> Explainable AI
                  </Badge>
                  <Badge variant="outline" className="border-emerald-400/30 text-emerald-400 bg-emerald-400/5 px-3 py-1">
                    <Shield className="w-3 h-3 mr-1" /> Threat Intelligence
                  </Badge>
                </div>
              </div>
            )}

            {/* Analyzer Form */}
            <div className="max-w-3xl mx-auto">
              {!result && !isLoading && (
                <AnalyzerForm onAnalyze={handleAnalyze} isLoading={isLoading} />
              )}

              {isLoading && <LoadingState stage={loadingStage} />}

              {/* Analysis Result - New Dashboard Layout */}
              {result && !isLoading && (
                <div className="space-y-6 fade-in">
                  {/* Result Header with Gauge */}
                  <div className="glass-card rounded-2xl p-6 border border-border/30">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      {/* Risk Gauge */}
                      <RiskScoreGauge score={result.risk_score} label={result.risk_label} />

                      {/* Summary */}
                      <div className="flex-1 text-center md:text-left">
                        <h2 className="text-xl font-bold text-foreground mb-1">
                          {result.product} Analysis Complete
                        </h2>
                        <p className="text-sm text-muted-foreground mb-3">
                          Channel: {result.meta.channel} • {result.meta.sender_name || "Unknown sender"}
                        </p>

                        {/* Media Tags */}
                        {result.meta.media_analyzed && result.meta.media_analyzed.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3 justify-center md:justify-start">
                            {result.meta.media_analyzed.map((media, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="border-primary/30 text-primary bg-primary/5 text-[11px]"
                              >
                                {media} analyzed
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* AI Services */}
                        <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                          {result.used_services.map((service, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20 text-[11px]"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Risk Scoring */}
                  <AdvancedRiskScoring
                    riskScore={result.risk_score}
                    riskCategory={result.risk_category}
                    confidenceScore={result.confidence_score}
                    fraudLikelihood={result.fraud_likelihood}
                    severityLevel={result.severity_level}
                  />

                  {/* Foundry Intelligence Layer (Grounded Retrieval) */}
                  {result.foundry_intelligence && (
                    <FoundryIntelligenceLayer data={result.foundry_intelligence} />
                  )}

                  {/* Multi-Step AI Reasoning Engine */}
                  {result.reasoning_steps && result.reasoning_steps.length > 0 && (
                    <ReasoningWorkflow steps={result.reasoning_steps} />
                  )}

                  {/* Security Evidence Panel */}
                  {result.security_indicators && result.security_indicators.length > 0 && (
                    <SecurityEvidencePanel indicators={result.security_indicators} />
                  )}

                  {/* AI Explanation Panel */}
                  <AIExplanationPanel data={result} />

                  {/* Reset Link */}
                  <div className="text-center pt-2">
                    <button
                      onClick={handleReset}
                      className="text-primary hover:text-primary/80 underline underline-offset-4 text-sm transition-colors"
                    >
                      ← Analyze another message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </main>

      <ChatBot />
    </div>
  );
};

export default Index;
