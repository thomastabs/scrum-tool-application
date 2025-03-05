
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import SprintForm from "@/components/SprintForm";
import Backlog from "@/components/Backlog";
import SprintTimeline from "@/components/sprint/SprintTimeline";
import { Sprint } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  CalendarIcon,
  UsersIcon,
} from "lucide-react";
import ProjectForm from "@/components/ProjectForm";
import CollaboratorForm from "@/components/CollaboratorForm";
import CollaboratorsList from "@/components/CollaboratorsList";
import { supabase } from "@/lib/supabase";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, sprints, deleteProject } = useProject();
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showCollaboratorForm, setShowCollaboratorForm] = useState(false);
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Find the project by ID
  const project = projects.find(p => p.id === projectId);
  
  useEffect(() => {
    const checkUserStatus = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        
        if (project) {
          // Check if the user is the project owner
          setIsProjectOwner(project.user_id === data.user.id);
        }
      }
    };
    
    checkUserStatus();
  }, [project]);
  
  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="mb-6">The project you're looking for does not exist.</p>
          <Button asChild>
            <Link to="/my-projects">Go Back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  const projectSprints = sprints.filter(
    (sprint) => sprint.projectId === project.id
  );

  const handleDeleteProject = () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(project.id);
      navigate("/my-projects");
    }
  };

  const handleEditSprint = (sprint: Sprint) => {
    setSprintToEdit(sprint);
    setShowSprintForm(true);
  };

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <Button
        variant="ghost"
        asChild
        className="mb-6"
      >
        <Link to="/my-projects">
          ← Back to Projects
        </Link>
      </Button>
      
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            {isProjectOwner && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEditProject(true)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={handleDeleteProject}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {project.description}
          </p>
        </div>
        <div className="flex gap-2">
          {isProjectOwner && (
            <Button onClick={() => setShowCollaboratorForm(true)}>
              <UsersIcon className="h-4 w-4 mr-1" /> Invite
            </Button>
          )}
          <Button onClick={() => setShowSprintForm(true)}>
            <PlusIcon className="h-4 w-4 mr-1" /> New Sprint
          </Button>
        </div>
      </div>

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
          <TabsTrigger value="collaborators">
            <UsersIcon className="h-4 w-4 mr-2" /> Collaborators
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="animate-fade-in">
          {projectSprints.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No Sprints Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first sprint to start managing tasks.
              </p>
              <Button onClick={() => setShowSprintForm(true)}>
                <PlusIcon className="h-4 w-4 mr-1" /> Create Sprint
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectSprints.map((sprint) => (
                <Card
                  key={sprint.id}
                  className={`hover:shadow-md transition-shadow ${
                    sprint.isCompleted
                      ? "bg-secondary/30"
                      : "bg-background"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-xl">
                        {sprint.title}
                      </CardTitle>
                      {sprint.isCompleted && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <CardDescription>
                      {new Date(sprint.startDate).toLocaleDateString()} -{" "}
                      {new Date(sprint.endDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-2">
                      {sprint.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSprint(sprint)}
                    >
                      <PencilIcon className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      asChild
                    >
                      <Link to={`/my-projects/${project.id}/sprint/${sprint.id}`}>
                        View Board
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
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

        <TabsContent value="collaborators" className="animate-fade-in">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium">Project Collaborators</h3>
              {isProjectOwner && (
                <Button onClick={() => setShowCollaboratorForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-1" /> Invite Collaborator
                </Button>
              )}
            </div>
            <CollaboratorsList projectId={project.id} isOwner={isProjectOwner} />
          </div>
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

      {showCollaboratorForm && (
        <CollaboratorForm
          projectId={project.id}
          onClose={() => setShowCollaboratorForm(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
