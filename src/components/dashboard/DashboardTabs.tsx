
import React from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboardIcon,
  FolderIcon,
  UsersIcon,
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
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="overview">
          <LayoutDashboardIcon className="h-4 w-4 mr-2" /> Overview
        </TabsTrigger>
        <TabsTrigger value="projects">
          <FolderIcon className="h-4 w-4 mr-2" /> Projects
        </TabsTrigger>
        <TabsTrigger value="collaborations">
          <UsersIcon className="h-4 w-4 mr-2" /> Collaborations
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
    </Tabs>
  );
};

export default DashboardTabs;
