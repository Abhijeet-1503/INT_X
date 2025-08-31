import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import ApiConfig from "./pages/ApiConfig";
import Level1 from "./pages/Level1";
import Level2 from "./pages/Level2";
import Level3 from "./pages/Level3";
import Level4 from "./pages/Level4";
import Level5 from "./pages/Level5";
import MobileWireless from "./pages/MobileWireless";
import MobileApp from "./pages/MobileAppBasic";
import NotFound from "./pages/NotFound";
import StartSession from "./pages/StartSession";
import { initializeAPIKeys } from "./lib/apiUtils";
import { refreshAPIKeys } from "./lib/initializeKeys";
import ErrorBoundary from "./components/ErrorBoundary";
const queryClient = new QueryClient();

// Initialize and refresh API keys on app startup
initializeAPIKeys();
refreshAPIKeys();

const App = () => {

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <HashRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/start" element={<StartSession />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/config"
                  element={
                    <ProtectedRoute>
                      <ApiConfig />
                    </ProtectedRoute>
                  }
                />
                <Route path="/level1" element={<ErrorBoundary><Level1 /></ErrorBoundary>} />
                <Route path="/level2" element={<ErrorBoundary><Level2 /></ErrorBoundary>} />
                <Route path="/level3" element={<ErrorBoundary><Level3 /></ErrorBoundary>} />
                <Route path="/level4" element={<ErrorBoundary><Level4 /></ErrorBoundary>} />
                <Route path="/level5" element={<ErrorBoundary><Level5 /></ErrorBoundary>} />
                <Route path="/mobile-wireless/:sessionId" element={<MobileWireless />} />
                <Route path="/mobile-app" element={<MobileApp />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HashRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
