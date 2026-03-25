// ============================================================
// App — Roteamento principal da plataforma TransparênciaIA
// Design: Intelligence Dashboard — dark theme, Sora + DM Sans
// ============================================================

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Home from "./pages/Home";
import Parlamentares from "./pages/Parlamentares";
import Grafos from "./pages/Grafos";
import Contratos from "./pages/Contratos";
import Alertas from "./pages/Alertas";
import Fontes from "./pages/Fontes";
import Metodologia from "./pages/Metodologia";
import NotFound from "./pages/NotFound";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/parlamentares" component={Parlamentares} />
      <Route path="/grafos" component={Grafos} />
      <Route path="/contratos" component={Contratos} />
      <Route path="/alertas" component={Alertas} />
      <Route path="/fontes" component={Fontes} />
      <Route path="/metodologia" component={Metodologia} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: 'rgba(30,41,59,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#F1F5F9',
                backdropFilter: 'blur(8px)',
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
