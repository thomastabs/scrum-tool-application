
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { Project } from "@/types";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { projects } = useProject();
  const [user, setUser] = useState<any>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Get the 'tab' query parameter from the URL
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'overview';

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(data.user);
        
        // Fetch projects for this user
        if (data.user) {
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('owner_id', data.user.id)
            .order('created_at', { ascending: false });
          
          if (projectsError) throw projectsError;
          
          // Convert database projects to app Project type
          const convertedProjects = projectsData.map(project => ({
            id: project.id,
            title: project.title,
            description: project.description || '',
            endGoal: project.end_goal || '',
            createdAt: new Date(project.created_at),
            updatedAt: new Date(project.created_at) // using created_at as fallback if no updated_at
          }));
          
          setUserProjects(convertedProjects);
        }
      } catch (error: any) {
        console.error("Error fetching user or projects:", error.message);
        toast({
          title: "Error",
          description: "Failed to fetch your projects. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <DashboardHeader user={user} />
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-pulse">Loading your projects...</div>
            </div>
          ) : (
            <DashboardTabs activeTab={activeTab} projects={userProjects} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
