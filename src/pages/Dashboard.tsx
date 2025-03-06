
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

const Dashboard = () => {
  const { projects } = useProject();
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  // Get the 'tab' query parameter from the URL
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'overview';

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUser();
  }, []);

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
