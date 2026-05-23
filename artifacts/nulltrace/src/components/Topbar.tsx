import { Bell, Search, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetHealthScore, getGetHealthScoreQueryKey, useListIncidents } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useState } from "react";

export function Topbar() {
  const [, setLocation] = useLocation();
  const [showProfile, setShowProfile] = useState(false);

  const { data: healthData } = useGetHealthScore({ query: { queryKey: getGetHealthScoreQueryKey() } });
  const { data: incidents } = useListIncidents(undefined, {
    query: { refetchInterval: 30000 },
  });

  const score = healthData?.score || 100;
  const scoreColor = score >= 85 ? "text-green-500" : score >= 70 ? "text-yellow-500" : "text-red-500";

  const openCount = Array.isArray(incidents)
    ? incidents.filter((i: { status: string; severity: string }) =>
        (i.status === "OPEN" || i.status === "INVESTIGATING") &&
        (i.severity === "CRITICAL" || i.severity === "HIGH")
      ).length
    : 0;

  const handleSignOut = () => {
    setLocation("/signin");
  };

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
          <div className={`font-mono font-bold ${scoreColor}`}>{score}%</div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setLocation("/incidents")}
          title="View open incidents"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {openCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-blink">
              {openCount > 9 ? "9+" : openCount}
            </span>
          )}
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setShowProfile((p) => !p)}
            title="Profile"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          </Button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 mt-2 w-52 glass-card rounded-xl border border-border shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold">Demo User</p>
                  <p className="text-xs text-muted-foreground">demo@nulltrace.io</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
