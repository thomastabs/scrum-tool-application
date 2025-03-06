import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProjectProvider } from "./context/ProjectContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import SprintPage from "./pages/SprintPage";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Confirmation from "./pages/auth/Confirmation";
import Callback from "./pages/auth/Callback";
import AuthGuard from "./components/auth/AuthGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <ProjectProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Auth routes */}
                  <Route path="/auth/sign-in" element={<SignIn />} />
                  <Route path="/auth/sign-up" element={<SignUp />} />
                  <Route path="/auth/confirmation" element={<Confirmation />} />
                  <Route path="/auth/callback" element={<Callback />} />
                  
                  {/* Protected routes */}
                  <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
                  <Route path="/my-projects/:projectId" element={<AuthGuard><ProjectDetailPage /></AuthGuard>} />
                  <Route path="/my-projects/:projectId/sprint/:sprintId" element={<AuthGuard><SprintPage /></AuthGuard>} />
                  
                  {/* Other routes */}
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </BrowserRouter>
            </ProjectProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
