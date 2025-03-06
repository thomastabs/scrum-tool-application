
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import SprintForm from "@/components/SprintForm";
import Backlog from "@/components/Backlog";
import SprintTimeline from "@/components/sprint/SprintTimeline";
import { Sprint } from "@/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  LayoutDashboardIcon,
  ListChecksIcon,
  CalendarIcon,
} from "lucide-react";
import ProjectForm from "@/components/ProjectForm";
import ProjectHeader from "@/components/project/ProjectHeader";
import SprintsList from "@/components/project/SprintsList";
import ProjectNotFound from "@/components/project/ProjectNotFound";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, sprints, deleteProject } = useProject();
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null);

  // Find the project by ID
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return <ProjectNotFound />;
  }

  const projectSprints = sprints.filter(
    (sprint) => sprint.projectId === project.id
  );

  const handleDeleteProject = () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(project.id);
      navigate("/?tab=projects");
    }
  };

  const handleEditSprint = (sprint: Sprint) => {
    setSprintToEdit(sprint);
    setShowSprintForm(true);
  };

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <ProjectHeader 
        project={project}
        onDelete={handleDeleteProject}
        onEdit={() => setShowEditProject(true)}
        onNewSprint={() => setShowSprintForm(true)}
      />

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
        </TabsList>

        <TabsContent value="board" className="animate-fade-in">
          <SprintsList 
            sprints={projectSprints}
            projectId={project.id}
            onCreateSprint={() => setShowSprintForm(true)}
            onEditSprint={handleEditSprint}
          />
        </TabsContent>

        <TabsContent value="backlog" className="animate-fade-in">
          <Backlog projectId={project.id} />
        </TabsContent>

        <TabsContent value="timeline" className="animate-fade-in">
          <SprintTimeline 
            sprints={projectSprints} 
            onCreateSprint={() => setShowSprintForm(true)} 
          />
        </TabsContent>
      </Tabs>

      {showSprintForm && (
        <SprintForm
          onClose={() => {
            setShowSprintForm(false);
            setSprintToEdit(null);
          }}
          sprintToEdit={sprintToEdit || undefined}
        />
      )}

      {showEditProject && (
        <ProjectForm
          onClose={() => setShowEditProject(false)}
          projectToEdit={{
            id: project.id,
            title: project.title,
            description: project.description,
            endGoal: project.endGoal,
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
