
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { Project } from "@/types";
import { getProjectsFromDB, getSession } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "overview";

  useEffect(() => {
    async function fetchUserAndProjects() {
      try {
        setIsLoading(true);
        const { session, error } = await getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          setUserId(session.user.id);
          setUser(session.user); // Store the user information
          
          // Only fetch projects if we have a userId
          const { data, error: projectsError } = await getProjectsFromDB(session.user.id);
          
          if (projectsError) {
            throw projectsError;
          }
          
          setProjects(data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserAndProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <DashboardHeader user={user} />
      <div className="mt-8">
        <DashboardTabs activeTab={activeTab} projects={projects} />
      </div>
    </div>
  );
};

export default Dashboard;
