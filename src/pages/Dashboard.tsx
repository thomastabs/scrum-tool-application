
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

const Dashboard = () => {
  const { projects } = useProject();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Get the 'tab' query parameter from the URL
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'overview';

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      
      if (!data.user) {
        navigate('/sign-in');
        return;
      }
      
      setUser(data.user);
      setLoading(false);
    };
    
    getUser();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/sign-in');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
