import { useState } from "react";
import Header from "@/components/Header";
import AnalyzerForm from "@/components/AnalyzerForm";
import LoadingState from "@/components/LoadingState";
import AnalysisResult, { type AnalysisResultData } from "@/components/AnalysisResult";
import ShieldIcon from "@/components/ShieldIcon";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Shield, Zap, Eye } from "lucide-react";

// Mock analysis result for demo (replace with actual API call)
const mockAnalysis: AnalysisResultData = {
  product: "GenStar",
  used_services: ["Azure OpenAI", "Azure AI Vision", "Azure AI Speech", "Azure Machine Learning"],
  risk_label: "High",
  risk_score: 78,
  manipulation_tags: ["urgency", "authority", "request_money"],
  explanation: "This message uses urgency ('urgent'), authority (appears to come from your manager) and a direct request for money/OTP. These are classic social-engineering cues. The language pattern suggests AI-generated content designed to bypass typical security awareness.",
  safe_rewrite: "Hi [Manager Name], I see your message — I will verify. Please call my direct number or confirm via company chat before I proceed with any transaction.",
  next_actions: [
    "Do not send OTP or money",
    "Call the sender on the official number to verify",
    "Report this message to IT Security"
  ],
  evidence: [
    { source: "text", reason: "Contains urgent demand for money and OTP with authority claims", confidence: 85 },
    { source: "ml", reason: "Azure ML flagged high urgency & request_money patterns", confidence: 72 },
    { source: "vision", reason: "No image provided for analysis", confidence: 0 },
  ],
  meta: {
    channel: "email",
    sender_name: "Manager Name",
    timestamp: new Date().toISOString()
  }
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const [loadingStage, setLoadingStage] = useState<"scanning" | "analyzing" | "processing">("scanning");

  const handleAnalyze = async (data: { text: string; channel: string; file: File | null }) => {
    setIsLoading(true);
    setResult(null);
    
    // Simulate API stages
    setLoadingStage("scanning");
    await new Promise(r => setTimeout(r, 1000));
    setLoadingStage("analyzing");
    await new Promise(r => setTimeout(r, 1500));
    setLoadingStage("processing");
    await new Promise(r => setTimeout(r, 1000));
    
    // In production, this would call your backend API
    // For demo, we return mock data with the user's channel
    setResult({
      ...mockAnalysis,
      meta: { ...mockAnalysis.meta, channel: data.channel }
    });
    setIsLoading(false);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen cyber-bg circuit-pattern">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        {!result && !isLoading && (
          <div className="text-center mb-12 fade-in">
            <div className="flex justify-center mb-6">
              <ShieldIcon animated size={80} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              AI-Powered Threat Detection
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Detect targeted phishing, social engineering, and deepfake impersonation 
              with advanced Microsoft AI services.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-4 py-1.5">
                <Sparkles className="w-3 h-3 mr-1" />
                Azure OpenAI
              </Badge>
              <Badge variant="outline" className="border-cyan-400/30 text-cyan-400 bg-cyan-400/5 px-4 py-1.5">
                <Eye className="w-3 h-3 mr-1" />
                AI Vision
              </Badge>
              <Badge variant="outline" className="border-violet-400/30 text-violet-400 bg-violet-400/5 px-4 py-1.5">
                <Zap className="w-3 h-3 mr-1" />
                AI Speech
              </Badge>
              <Badge variant="outline" className="border-emerald-400/30 text-emerald-400 bg-emerald-400/5 px-4 py-1.5">
                <Shield className="w-3 h-3 mr-1" />
                Azure ML
              </Badge>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          {!result && !isLoading && (
            <AnalyzerForm onAnalyze={handleAnalyze} isLoading={isLoading} />
          )}

          {isLoading && (
            <LoadingState stage={loadingStage} />
          )}

          {result && !isLoading && (
            <div className="space-y-6">
              <AnalysisResult data={result} />
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="text-primary hover:text-primary/80 underline underline-offset-4 text-sm transition-colors"
                >
                  Analyze another message
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-sm text-muted-foreground">
          <p>Microsoft Imagine Cup 2026 • GenStar MVP Demo</p>
          <p className="text-xs mt-2 opacity-70">
            This is a demo. Connect to Azure services for full functionality.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
