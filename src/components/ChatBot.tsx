import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send, Bot, User, Loader2, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const QUICK_REPLIES = [
  "How do I spot a phishing email?",
  "What are signs of a deepfake?",
  "Is this link safe to click?",
  "How to protect my accounts?",
];

const genId = () => Math.random().toString(36).slice(2, 10);

const INITIAL_MESSAGE: Message = {
  id: genId(),
  role: "assistant",
  content:
    "👋 Hi! I'm **GenStar AI**, your cybersecurity assistant.\n\nI can help you with:\n- 🎣 **Phishing detection** — spot scam emails & messages\n- 🤖 **Deepfake analysis** — identify AI-generated media\n- 🔐 **Security advice** — protect your digital life\n\nAsk me anything or tap a suggestion below!",
  timestamp: new Date(),
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
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
      chatMessages,
      onDelta,
      onDone,
    }: {
      chatMessages: { role: string; content: string }[];
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
          body: JSON.stringify({ messages: chatMessages }),
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
          description: "AI usage limit reached. Please try again later.",
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
          } catch {
            /* ignore */
          }
        }
      }

      onDone();
    },
    [toast]
  );

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setShowQuickReplies(false);
    const userMsg: Message = { id: genId(), role: "user", content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const assistantId = genId();
    let assistantSoFar = "";

    const chatHistory = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages((prev) => {
        const existing = prev.find((m) => m.id === assistantId);
        if (existing) {
          return prev.map((m) => (m.id === assistantId ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { id: assistantId, role: "assistant" as const, content: assistantSoFar, timestamp: new Date() }];
      });
    };

    try {
      await streamChat({
        chatMessages: chatHistory,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
      });
    } catch (e) {
      console.error(e);
      if (!assistantSoFar) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "⚠️ Sorry, I couldn't process that request. Please try again.",
            timestamp: new Date(),
          },
        ]);
      }
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setShowQuickReplies(true);
  };

  const messageCount = messages.filter((m) => m.role === "user").length;

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

      {/* Notification badge */}
      {!isOpen && (
        <span className="fixed bottom-[4.25rem] right-6 z-50 w-3 h-3 rounded-full bg-success animate-pulse pointer-events-none" />
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-6 z-50",
            "w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-8rem)]",
            "glass-card rounded-2xl overflow-hidden",
            "flex flex-col",
            "fade-in",
            "border border-border/50"
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-[hsl(187,80%,40%)] flex items-center justify-center shadow-[0_0_15px_hsla(187,100%,50%,0.3)]">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-sm">GenStar AI Assistant</h3>
              <p className="text-xs text-muted-foreground">
                {isLoading ? (
                  <span className="text-primary animate-pulse">Thinking...</span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    Online • {messageCount} messages
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Clear chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>p+p]:mt-2 [&>ul]:mt-1 [&>ul]:mb-1 [&>ol]:mt-1 [&>ol]:mb-1 [&_li]:my-0.5 [&_strong]:text-primary [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_a]:text-primary [&_a]:underline">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center mt-0.5">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && !messages.find((m) => m.role === "assistant" && messages.indexOf(m) === messages.length - 1) && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {showQuickReplies && !isLoading && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full",
                    "bg-primary/10 text-primary border border-primary/20",
                    "hover:bg-primary/20 hover:border-primary/40",
                    "transition-all duration-200"
                  )}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border bg-card/80 backdrop-blur-sm">
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
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5">
              Powered by GenStar AI • Responses may not be 100% accurate
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
