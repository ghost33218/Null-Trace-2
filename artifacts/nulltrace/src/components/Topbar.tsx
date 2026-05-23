import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetHealthScore, getGetHealthScoreQueryKey } from "@workspace/api-client-react";

export function Topbar() {
  const { data: healthData } = useGetHealthScore({ query: { queryKey: getGetHealthScoreQueryKey() } });

  const score = healthData?.score || 100;
  const scoreColor = score >= 85 ? "text-green-500" : score >= 70 ? "text-yellow-500" : "text-red-500";

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center w-96 relative">
        <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
        <Input 
          placeholder="Search resources, logs, or ask AI..." 
          className="pl-9 bg-muted/50 border-none focus-visible:ring-primary/50 transition-all"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Health</div>
          <div className={`font-mono font-bold ${scoreColor}`}>
            {score}%
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-blink"></span>
        </Button>
      </div>
    </header>
  );
}
