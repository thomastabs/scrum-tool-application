
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboardIcon,
  FolderIcon,
  UsersIcon,
  Settings2Icon,
} from "lucide-react";
import ProjectOverview from "./ProjectOverview";
import ProjectsList from "./ProjectsList";
import CollaborationsTab from "./CollaborationsTab";
import { Project } from "@/types";

interface DashboardTabsProps {
  activeTab: string;
  projects: Project[];
}

const DashboardTabs = ({ activeTab, projects }: DashboardTabsProps) => {
  const navigate = useNavigate();
  
  const handleTabChange = (value: string) => {
    navigate(`/?tab=${value}`);
  };

  return (
    <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="overview">
          <LayoutDashboardIcon className="h-4 w-4 mr-2" /> Overview
        </TabsTrigger>
        <TabsTrigger value="projects">
          <FolderIcon className="h-4 w-4 mr-2" /> Projects
        </TabsTrigger>
        <TabsTrigger value="collaborations">
          <UsersIcon className="h-4 w-4 mr-2" /> Collaborations
        </TabsTrigger>
        <TabsTrigger value="settings">
          <Settings2Icon className="h-4 w-4 mr-2" /> Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
        <ProjectOverview projects={projects} />
      </TabsContent>

      <TabsContent value="projects" className="animate-fade-in">
        <ProjectsList projects={projects} />
      </TabsContent>

      <TabsContent value="collaborations" className="animate-fade-in">
        <CollaborationsTab />
      </TabsContent>

      <TabsContent value="settings" className="animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
        {/* Settings content will go here in the future */}
        <div className="text-center py-12 bg-accent/30 rounded-lg border border-border">
          <Settings2Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Settings coming soon</h3>
          <p className="text-muted-foreground">
            Account and application settings will be available here soon.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
