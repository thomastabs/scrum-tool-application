
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { supabase, deleteAllProjectsFromDB } from "@/lib/supabase";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { projects, deleteAllProjects } = useProject();
  const [user, setUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDeleteAllProjects = async () => {
    if (!user) return;
    
    if (window.confirm("Are you sure you want to delete ALL projects? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await deleteAllProjectsFromDB();
        deleteAllProjects();
        toast({
          title: "All projects deleted",
          description: "All projects have been successfully deleted.",
        });
      } catch (error) {
        console.error("Failed to delete all projects:", error);
        toast({
          title: "Error",
          description: "Failed to delete all projects. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <DashboardHeader user={user} />
        
        {projects.length > 0 && (
          <div className="mb-6 flex justify-end">
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllProjects}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete All Projects"}
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6">
          <DashboardTabs activeTab={activeTab} projects={projects} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
