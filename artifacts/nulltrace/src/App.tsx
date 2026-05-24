import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertToaster } from "@/components/AlertToaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import SignInPage from "@/pages/SignInPage";
import IncidentsPage from "@/pages/IncidentsPage";
import IncidentDetailPage from "@/pages/IncidentDetailPage";
import ServicesPage from "@/pages/ServicesPage";
import MetricsPage from "@/pages/MetricsPage";
import LogsPage from "@/pages/LogsPage";
import AiChatPage from "@/pages/AiChatPage";
import TeamPage from "@/pages/TeamPage";
import { useEffect } from "react";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/signin" component={SignInPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/incidents" component={IncidentsPage} />
      <Route path="/incidents/:id" component={IncidentDetailPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/metrics" component={MetricsPage} />
      <Route path="/logs" component={LogsPage} />
      <Route path="/ai-chat" component={AiChatPage} />
      <Route path="/team" component={TeamPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <AlertToaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
