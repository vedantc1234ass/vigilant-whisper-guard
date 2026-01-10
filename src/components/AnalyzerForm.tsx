import { useState, forwardRef } from "react";
import { Scan, Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import FileUpload from "./FileUpload";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

interface AnalyzerFormProps {
  onAnalyze: (data: { text: string; channel: string; file: File | null }) => void;
  isLoading: boolean;
}

const AnalyzerForm = forwardRef<HTMLFormElement, AnalyzerFormProps>(({ onAnalyze, isLoading }, ref) => {
  const [text, setText] = useState("");
  const [channel, setChannel] = useState("email");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    onAnalyze({ text, channel, file });
  };

  const channels = [
    { value: "email", icon: Mail, label: "Email" },
    { value: "chat", icon: MessageCircle, label: "Chat" },
    { value: "voice", icon: Phone, label: "Voice" },
  ];

  return (
    <form ref={ref} onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Scan className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Analyze Content</h2>
          <p className="text-sm text-muted-foreground">
            Paste suspicious messages or upload media for AI analysis
          </p>
        </div>
      </div>

      {/* Channel Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Message Source
        </Label>
        <ToggleGroup 
          type="single" 
          value={channel} 
          onValueChange={(v) => v && setChannel(v)}
          className="justify-start gap-2"
        >
          {channels.map((ch) => (
            <ToggleGroupItem
              key={ch.value}
              value={ch.value}
              className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary data-[state=on]:border-primary/50 border border-border/50 px-4"
            >
              <ch.icon size={16} className="mr-2" />
              {ch.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Text Input */}
      <div className="space-y-3">
        <Label htmlFor="message" className="text-sm font-medium text-foreground">
          Message Content
        </Label>
        <Textarea
          id="message"
          placeholder="Paste the suspicious email, message, or text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[160px] bg-background/50 border-border/50 focus:border-primary/50 resize-none placeholder:text-muted-foreground/50"
        />
      </div>

      {/* File Upload */}
      <FileUpload onFileSelect={setFile} selectedFile={file} />

      {/* Submit Button */}
      <Button 
        type="submit" 
        variant="cyber" 
        size="xl" 
        className="w-full"
        disabled={isLoading || (!text.trim() && !file)}
      >
        {isLoading ? (
          <>
            <div className="flex gap-1 mr-2">
              <div className="loading-dot w-2 h-2 bg-primary-foreground rounded-full" />
              <div className="loading-dot w-2 h-2 bg-primary-foreground rounded-full" />
              <div className="loading-dot w-2 h-2 bg-primary-foreground rounded-full" />
            </div>
            Analyzing...
          </>
        ) : (
          <>
            <Scan size={20} />
            Analyze for Threats
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Powered by Azure OpenAI • Azure AI Vision • Azure AI Speech • Azure ML
      </p>
    </form>
  );
});

AnalyzerForm.displayName = "AnalyzerForm";

export default AnalyzerForm;
