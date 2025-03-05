
import React from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { FolderIcon, UsersIcon } from "lucide-react";
import ProjectOverview from "./ProjectOverview";
import ProjectsList from "./ProjectsList";
import CollaborationsTab from "./CollaborationsTab";
import { Project } from "@/types";

interface DashboardTabsProps {
  activeTab: string;
  projects: Project[];
}

const DashboardTabs = ({ activeTab, projects }: DashboardTabsProps) => {
  return (
    <Tabs defaultValue={activeTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <FolderIcon className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="projects" className="flex items-center gap-2">
          <FolderIcon className="h-4 w-4" />
          My Projects
        </TabsTrigger>
        <TabsTrigger value="collaborations" className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4" />
          My Collaborations
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="animate-fade-in">
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
