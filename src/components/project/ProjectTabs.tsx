
import React from "react";
import { Sprint } from "@/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { LayoutDashboardIcon, ListChecksIcon, CalendarIcon, ActivityIcon } from "lucide-react";
import SprintsList from "@/components/project/SprintsList";
import Backlog from "@/components/Backlog";
import SprintTimeline from "@/components/sprint/SprintTimeline";
import BurndownChart from "@/components/project/BurndownChart";

interface ProjectTabsProps {
  projectId: string;
  sprints: Sprint[];
  onCreateSprint: () => void;
  onEditSprint: (sprint: Sprint) => void;
  onViewSprint: (sprint: Sprint) => void;
}

const ProjectTabs: React.FC<ProjectTabsProps> = ({
  projectId,
  sprints,
  onCreateSprint,
  onEditSprint,
  onViewSprint,
}) => {
  return (
    <Tabs defaultValue="board">
      <TabsList className="mb-8">
        <TabsTrigger value="board">
          <LayoutDashboardIcon className="h-4 w-4 mr-2" /> Sprints
        </TabsTrigger>
        <TabsTrigger value="backlog">
          <ListChecksIcon className="h-4 w-4 mr-2" /> Product Backlog
        </TabsTrigger>
        <TabsTrigger value="timeline">
          <CalendarIcon className="h-4 w-4 mr-2" /> Timeline
        </TabsTrigger>
        <TabsTrigger value="burndown">
          <ActivityIcon className="h-4 w-4 mr-2" /> Burndown Chart
        </TabsTrigger>
      </TabsList>

      <TabsContent value="board" className="animate-fade-in">
        <SprintsList 
          sprints={sprints}
          projectId={projectId}
          onCreateSprint={onCreateSprint}
          onEditSprint={onEditSprint}
          onViewSprint={onViewSprint}
        />
      </TabsContent>

      <TabsContent value="backlog" className="animate-fade-in">
        <Backlog projectId={projectId} />
      </TabsContent>

      <TabsContent value="timeline" className="animate-fade-in">
        <SprintTimeline 
          sprints={sprints} 
          onCreateSprint={onCreateSprint} 
        />
      </TabsContent>

      <TabsContent value="burndown" className="animate-fade-in">
        <BurndownChart projectId={projectId} />
      </TabsContent>
    </Tabs>
  );
};

export default ProjectTabs;
