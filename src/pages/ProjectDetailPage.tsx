
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { supabase } from "@/lib/supabase";
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
import { toast } from "@/components/ui/use-toast";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, sprints, deleteProject } = useProject();
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState<Project | null>(null);

  // Find the project by ID from context first
  const contextProject = projects.find(p => p.id === projectId);

  // Fetch the project directly from Supabase if not found in context
  useEffect(() => {
    const fetchProjectData = async () => {
      if (contextProject) {
        setProjectData(contextProject);
        setIsLoading(false);
        return;
      }
      
      try {
        if (!projectId) {
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        
        if (error) {
          console.error("Error fetching project:", error);
          toast({
            title: "Error",
            description: "Failed to load project details",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        if (data) {
          // Convert the database project structure to our app's Project type
          const fetchedProject: Project = {
            id: data.id,
            title: data.title,
            description: data.description || "",
            endGoal: data.end_goal || "",
            ownerId: data.owner_id,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at || data.created_at),
          };
          
          setProjectData(fetchedProject);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, contextProject]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Use either the context project or fetched project data
  const project = projectData;
  
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
          projectId={project.id}
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
