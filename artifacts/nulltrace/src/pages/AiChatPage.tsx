import { MainLayout } from "@/components/MainLayout";
import { useState, useRef, useEffect } from "react";
import { useAiChat } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Send, User, Sparkles, Terminal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AiChatPage() {
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'ai', content: "NullTrace AI initialized. I have full context on your current infrastructure state, logs, and recent incidents. How can I assist you?" }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatMutation = useAiChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput("");
    
    chatMutation.mutate({ data: { message: text } }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      }
    });
  };

  const suggestedPrompts = [
    "Why did checkout fail?",
    "Which service is unstable?",
    "Explain latest outage",
    "Show failed pods",
    "Suggest solution for DB timeout"
  ];

  const formatMessage = (content: string) => {
    // Basic markdown-like formatting for code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).replace(/^[a-z]+\n/, ''); // remove language identifier if present
        return (
          <div key={i} className="my-3 bg-black/90 p-4 rounded-md border border-border font-mono text-sm text-green-400 overflow-x-auto relative">
            <Terminal className="h-4 w-4 absolute top-2 right-2 text-muted-foreground opacity-50" />
            <pre>{code}</pre>
          </div>
        );
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="p-2 bg-primary/10 rounded-lg text-primary border border-primary/20">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
            <p className="text-muted-foreground text-sm">Context-aware infrastructure intelligence</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col glass-card rounded-xl border border-border overflow-hidden">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-12 rounded-tr-sm' 
                      : 'bg-muted/50 border border-border mr-12 rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                        {formatMessage(msg.content)}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-secondary" />
                    </div>
                  )}
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-background/50 border-t border-border">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="relative flex items-center"
              >
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your infrastructure..." 
                  className="pr-12 bg-background border-border h-12 rounded-xl focus-visible:ring-primary/50"
                  disabled={chatMutation.isPending}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="absolute right-1.5 h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                  disabled={!input.trim() || chatMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar / Suggested */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
            <div className="glass-card p-4 rounded-xl border border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Suggested Queries</h3>
              <div className="flex flex-col gap-2">
                {suggestedPrompts.map((prompt, i) => (
                  <Button 
                    key={i}
                    variant="outline" 
                    className="justify-start h-auto py-2 px-3 text-left whitespace-normal font-normal text-sm bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                    onClick={() => handleSend(prompt)}
                    disabled={chatMutation.isPending}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
