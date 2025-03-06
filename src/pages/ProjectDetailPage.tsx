
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import SprintForm from "@/components/SprintForm";
import Backlog from "@/components/Backlog";
import SprintTimeline from "@/components/sprint/SprintTimeline";
import { Sprint, Project } from "@/types";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { sprints, deleteProject } = useProject();
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null);

  // Fetch project data from Supabase
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      console.log("Fetching project details for:", projectId);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        throw error;
      }

      console.log("Project data retrieved:", data);
      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        endGoal: data.end_goal || '',
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(data.created_at),
      } as Project;
    },
  });

  if (error) {
    console.error("Error loading project:", error);
    toast({
      title: "Error",
      description: "Failed to load project details. Please try again.",
      variant: "destructive"
    });
  }

  const projectSprints = sprints.filter(
    (sprint) => sprint.projectId === projectId
  );

  const handleDeleteProject = () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(project?.id || '');
      navigate("/?tab=projects");
    }
  };

  const handleEditSprint = (sprint: Sprint) => {
    setSprintToEdit(sprint);
    setShowSprintForm(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center p-8">
          <div className="animate-pulse">Loading project details...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return <ProjectNotFound />;
  }

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
