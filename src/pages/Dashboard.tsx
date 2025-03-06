
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { supabase, getProjectsFromDB } from "@/lib/supabase";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { Project } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const { projects } = useProject();
  const [user, setUser] = useState<any>(null);
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
      } catch (error: any) {
        console.error("Error fetching user:", error.message);
        toast({
          title: "Error",
          description: "Failed to fetch user information. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getUser();
  }, []);

  // Use React Query to fetch projects
  const { 
    data: userProjects = [],
    isLoading: projectsLoading,
    error: projectsError 
  } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log("Fetching projects for user:", user.id);
      const { data, error } = await getProjectsFromDB(user.id);
      
      if (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }
      
      console.log("Raw project data:", data);
      
      // Convert database projects to app Project type
      return data?.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description || '',
        endGoal: project.end_goal || '',
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.created_at) // using created_at as fallback if no updated_at
      })) || [];
    },
    enabled: !!user?.id, // Only run the query if we have a user ID
  });

  if (projectsError) {
    console.error("Error in projects query:", projectsError);
    toast({
      title: "Error",
      description: "Failed to fetch your projects. Please try again.",
      variant: "destructive"
    });
  }

  const isLoadingData = isLoading || (user && projectsLoading);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <DashboardHeader user={user} />
        <div className="grid grid-cols-1 gap-6">
          {isLoadingData ? (
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
