
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { Project } from "@/types";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { setProjects } = useProject();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Get the 'tab' query parameter from the URL
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'overview';

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
        
        if (data.user) {
          // Fetch projects for the current user
          await fetchUserProjects(data.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting user:", error);
        setError("Failed to load user data. Please refresh the page.");
        setLoading(false);
      }
    };
    
    getUser();
  }, []);

  const fetchUserProjects = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects. Please try again.");
        setLoading(false);
        return;
      }
      
      // Convert the projects data and update state
      const formattedProjects = projectsData ? projectsData.map(project => ({
        ...project,
        id: project.id,
        title: project.title,
        description: project.description || "",
        endGoal: project.end_goal || "",
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.created_at)
      })) : [];
      
      console.log("Fetched projects:", formattedProjects);
      setUserProjects(formattedProjects);
      setProjects(formattedProjects);
    } catch (err) {
      console.error("Error in fetchUserProjects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh projects list
  const refreshProjects = async () => {
    if (user) {
      await fetchUserProjects(user.id);
      toast({
        title: "Projects refreshed",
        description: "Your projects list has been updated."
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <DashboardHeader user={user} onRefresh={refreshProjects} />
        
        {error && (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
            {error}
            <button 
              className="ml-4 underline" 
              onClick={refreshProjects}
            >
              Try Again
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6">
          <DashboardTabs 
            activeTab={activeTab} 
            projects={userProjects} 
            loading={loading} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
