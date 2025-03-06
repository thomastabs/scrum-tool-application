
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { Project } from "@/types";

const Dashboard = () => {
  const { projects: contextProjects, setProjects } = useProject();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const location = useLocation();

  // Get the 'tab' query parameter from the URL
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'overview';

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      if (data.user) {
        // Fetch projects for the current user
        const fetchUserProjects = async () => {
          try {
            const { data: projectsData, error } = await supabase
              .from('projects')
              .select('*')
              .eq('owner_id', data.user.id)
              .order('created_at', { ascending: false });
            
            if (error) {
              console.error("Error fetching projects:", error);
              return;
            }
            
            // Convert the dates from strings to Date objects
            const formattedProjects = projectsData.map(project => ({
              ...project,
              id: project.id,
              title: project.title,
              description: project.description || "",
              endGoal: project.end_goal || "",
              createdAt: new Date(project.created_at),
              updatedAt: new Date(project.created_at)
            }));
            
            setUserProjects(formattedProjects);
            setProjects(formattedProjects);
          } catch (error) {
            console.error("Error fetching projects:", error);
          } finally {
            setLoading(false);
          }
        };
        
        fetchUserProjects();
      } else {
        setLoading(false);
      }
    };
    
    getUser();
  }, [setProjects]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <DashboardHeader user={user} />
        <div className="grid grid-cols-1 gap-6">
          <DashboardTabs activeTab={activeTab} projects={userProjects} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
