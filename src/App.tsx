
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProjectProvider } from "./context/ProjectContext";
import { ThemeProvider } from "./context/ThemeContext";
import Dashboard from "./pages/Dashboard";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import SprintPage from "./pages/SprintPage";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { useState, useEffect } from "react";
import { getSession, supabase } from "./lib/supabase";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const { session } = await getSession();
      setSession(session);
      setLoading(false);
    }

    loadSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <ProjectProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Dashboard/Home page */}
                <Route
                  path="/"
                  element={
                    session ? (
                      <Dashboard />
                    ) : (
                      <Navigate to="/sign-in" replace />
                    )
                  }
                />
                
                {/* Project detail page */}
                <Route
                  path="/my-projects/:projectId"
                  element={
                    session ? (
                      <ProjectDetailPage />
                    ) : (
                      <Navigate to="/sign-in" replace />
                    )
                  }
                />
                
                {/* Sprint page */}
                <Route
                  path="/my-projects/:projectId/sprint/:sprintId"
                  element={
                    session ? (
                      <SprintPage />
                    ) : (
                      <Navigate to="/sign-in" replace />
                    )
                  }
                />
                
                {/* Auth routes */}
                <Route 
                  path="/sign-in" 
                  element={
                    session ? (
                      <Navigate to="/" replace />
                    ) : (
                      <SignIn />
                    )
                  } 
                />
                <Route 
                  path="/sign-up" 
                  element={
                    session ? (
                      <Navigate to="/" replace />
                    ) : (
                      <SignUp />
                    )
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ProjectProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
