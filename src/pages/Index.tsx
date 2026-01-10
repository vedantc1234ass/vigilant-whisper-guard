import { useState } from "react";
import Header from "@/components/Header";
import AnalyzerForm from "@/components/AnalyzerForm";
import LoadingState from "@/components/LoadingState";
import AnalysisResult, { type AnalysisResultData } from "@/components/AnalysisResult";
import ShieldIcon from "@/components/ShieldIcon";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Shield, Zap, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const [loadingStage, setLoadingStage] = useState<"scanning" | "analyzing" | "processing">("scanning");
  const { toast } = useToast();

  const handleAnalyze = async (data: { text: string; channel: string; file: File | null }) => {
    setIsLoading(true);
    setResult(null);
    
    // Show loading stages
    setLoadingStage("scanning");
    
    try {
      // Determine media types
      const hasImage = data.file?.type.startsWith('image/') || false;
      const hasAudio = data.file?.type.startsWith('audio/') || false;
      const hasVideo = data.file?.type.startsWith('video/') || false;

      // Convert file to base64 if present
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

      // Update loading stage
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
          toast({
            variant: "destructive",
            title: "Rate Limited",
            description: "Too many requests. Please wait a moment and try again.",
          });
        } else if (response.status === 402) {
          toast({
            variant: "destructive",
            title: "Usage Limit",
            description: "AI usage limit reached. Please add credits to continue.",
          });
        } else {
          throw new Error(errorData.error || "Analysis failed");
        }
        setIsLoading(false);
        return;
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
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
