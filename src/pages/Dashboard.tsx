
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { toast } from "@/components/ui/use-toast";

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
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          navigate('/sign-in');
          return;
        }
        
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Authentication Error",
          description: "There was a problem loading your profile",
          variant: "destructive"
        });
        navigate('/sign-in');
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/sign-in');
      } else if (event === 'SIGNED_IN') {
        getUser();
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
