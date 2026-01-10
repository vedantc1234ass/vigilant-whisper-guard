import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm GenStar AI, your cybersecurity assistant. Ask me about phishing detection, deepfakes, or any security threats!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const streamChat = useCallback(
    async ({
      messages,
      onDelta,
      onDone,
    }: {
      messages: Message[];
      onDelta: (deltaText: string) => void;
      onDone: () => void;
    }) => {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages }),
        }
      );

      if (resp.status === 429) {
        toast({
          variant: "destructive",
          title: "Rate Limited",
          description: "Too many requests. Please wait a moment.",
        });
        throw new Error("Rate limited");
      }

      if (resp.status === 402) {
        toast({
          variant: "destructive",
          title: "Usage Limit",
          description: "AI usage limit reached. Please add credits.",
        });
        throw new Error("Payment required");
      }

      if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch { /* ignore */ }
        }
      }

      onDone();
    },
    [toast]
  );

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2].role === "user") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full",
          "bg-gradient-to-r from-primary to-[hsl(187,80%,40%)]",
          "flex items-center justify-center",
          "shadow-[0_4px_20px_hsla(187,100%,50%,0.4)]",
          "hover:shadow-[0_6px_30px_hsla(187,100%,50%,0.6)]",
          "hover:-translate-y-1 active:translate-y-0",
          "transition-all duration-300",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-6 z-50",
            "w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)]",
            "glass-card rounded-2xl overflow-hidden",
            "flex flex-col",
            "fade-in"
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border bg-card/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-[hsl(187,80%,40%)] flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">GenStar AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Cybersecurity Expert</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] px-3 py-2 rounded-2xl text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary text-secondary-foreground px-3 py-2 rounded-2xl rounded-bl-md">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card/50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about threats, phishing, deepfakes..."
                className={cn(
                  "flex-1 bg-input border border-border rounded-xl px-4 py-2.5 text-sm",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                  "transition-all"
                )}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                variant="cyber"
                size="icon"
                className="rounded-xl h-10 w-10"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
