
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { projects } = useProject();
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the 'tab' query parameter from the URL
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'overview';

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/sign-in", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <DashboardHeader user={user} />
        <div className="grid grid-cols-1 gap-6">
          <DashboardTabs activeTab={activeTab} projects={projects} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
