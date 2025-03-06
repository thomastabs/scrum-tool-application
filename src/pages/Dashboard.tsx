
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { projects, setProjects } = useProject();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Get the 'tab' query parameter from the URL
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'overview';

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);
      
      if (!userData.user) {
        setLoading(false);
        setError("You must be logged in to view projects");
        return;
      }

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        setError("Failed to load your projects. Please try again.");
        setLoading(false);
        return;
      }

      // Transform the data to match the expected format
      const formattedProjects = projectsData.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description || "",
        endGoal: project.end_goal || "",
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.created_at),
      }));

      setProjects(formattedProjects);
      setLoading(false);
    } catch (err) {
      console.error("Error in fetchProjects:", err);
      setError("An unexpected error occurred. Please refresh the page.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRefresh = () => {
    fetchProjects();
    toast({
      title: "Refreshing projects",
      description: "Getting your latest projects from the database"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <DashboardHeader user={user} onRefresh={handleRefresh} />
        
        {error ? (
          <div className="bg-destructive/10 p-4 rounded-md mb-6">
            <p className="text-destructive font-medium">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={handleRefresh}
            >
              <ReloadIcon className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center my-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading your projects...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <DashboardTabs activeTab={activeTab} projects={projects} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
