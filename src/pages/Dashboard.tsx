
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

const Dashboard = () => {
  const { projects } = useProject();
  const location = useLocation();

  // Get the 'tab' query parameter from the URL
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'overview';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Scrumify Hub</h1>
            <p className="text-muted-foreground mt-2">Dashboard</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <DashboardTabs activeTab={activeTab} projects={projects} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
