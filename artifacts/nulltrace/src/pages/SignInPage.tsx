import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity } from "lucide-react";

export default function SignInPage() {
  const [, setLocation] = useLocation();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-primary/20 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-secondary/20 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="z-10 w-full max-w-md p-8 glass-card rounded-2xl border border-border shadow-2xl relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 border border-primary/20">
            <Activity className="h-6 w-6 text-primary neon-text-blue" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sign in to NullTrace</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter your credentials to access the war room</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input id="email" type="email" placeholder="engineer@company.com" required className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <Input id="password" type="password" required className="bg-background/50" />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground neon-border-blue h-11">
            Sign In
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account? <Link href="#" className="text-primary hover:underline">Request access</Link>
        </div>
      </div>
    </div>
  );
}
