import { MainLayout } from "@/components/MainLayout";
import { useListLogs, getListLogsQueryKey } from "@workspace/api-client-react";
import { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Play, Pause } from "lucide-react";
import { format } from "date-fns";

export default function LogsPage() {
  const [level, setLevel] = useState<any>(undefined);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: logs } = useListLogs(
    { level, limit: 100 }, 
    { query: { queryKey: getListLogsQueryKey({ level }), refetchInterval: isPaused ? false : 3000 } }
  );

  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  const getLogColor = (lvl: string) => {
    switch(lvl) {
      case 'ERROR': return "text-red-400";
      case 'FATAL': return "text-red-500 font-bold bg-red-500/10";
      case 'WARN': return "text-yellow-400";
      case 'INFO': return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Live Logs</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)} className="border-border">
              {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
              {isPaused ? "Resume" : "Pause Stream"}
            </Button>
            <Select value={level || "ALL"} onValueChange={(v) => setLevel(v === "ALL" ? undefined : v)}>
              <SelectTrigger className="w-[120px] bg-background/50 border-border">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="DEBUG">DEBUG</SelectItem>
                <SelectItem value="INFO">INFO</SelectItem>
                <SelectItem value="WARN">WARN</SelectItem>
                <SelectItem value="ERROR">ERROR</SelectItem>
                <SelectItem value="FATAL">FATAL</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-64">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Filter message..." className="pl-9 bg-background/50 border-border" />
            </div>
          </div>
        </div>

        <div className="flex-1 glass-card rounded-xl border border-border bg-black/90 overflow-hidden flex flex-col relative font-mono text-sm shadow-2xl">
          <div className="bg-muted/20 px-4 py-2 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-blink'}`} />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Terminal Output</span>
            </div>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1.5 scroll-smooth">
            {logs?.map((log) => (
              <div key={log.id} className={`flex gap-4 group hover:bg-white/5 px-2 py-0.5 rounded -mx-2 transition-colors ${log.isAnomaly ? 'bg-primary/10 border-l-2 border-primary' : ''}`}>
                <span className="text-muted-foreground shrink-0 select-none">
                  {format(new Date(log.timestamp), "HH:mm:ss.SSS")}
                </span>
                <span className={`w-14 shrink-0 font-bold ${getLogColor(log.level)}`}>
                  {log.level}
                </span>
                <span className="text-primary/70 shrink-0 w-24 truncate" title={log.service}>
                  [{log.service}]
                </span>
                <span className={`flex-1 break-all ${log.level === 'ERROR' || log.level === 'FATAL' ? 'text-red-300' : 'text-gray-300'}`}>
                  {log.message}
                </span>
                {log.traceId && (
                  <span className="text-muted-foreground/50 shrink-0 text-xs mt-0.5">
                    {log.traceId.slice(0,8)}
                  </span>
                )}
              </div>
            ))}
            {!isPaused && (
              <div className="flex gap-4 px-2 py-1">
                <span className="w-2 h-4 bg-muted-foreground animate-blink inline-block mt-0.5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
