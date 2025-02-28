
import React, { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import SprintForm from "@/components/SprintForm";
import Backlog from "@/components/Backlog";
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
  CalendarIcon,
  ListChecksIcon,
  ArrowLeftIcon,
} from "lucide-react";
import ProjectForm from "@/components/ProjectForm";

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, sprints, deleteProject } = useProject();
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null);
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === projectId);
  const projectSprints = sprints.filter(
    (sprint) => sprint.projectId === projectId
  );

  useEffect(() => {
    if (!project) {
      navigate("/projects");
    }
  }, [project, navigate]);

  const handleDeleteProject = () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(project!.id);
      navigate("/projects");
    }
  };

  const handleEditSprint = (sprint: Sprint) => {
    setSprintToEdit(sprint);
    setShowSprintForm(true);
  };

  if (!project) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <Button
        variant="ghost"
        onClick={() => navigate("/projects")}
        className="mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Projects
      </Button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{project.title}</h1>
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
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {project.description}
          </p>
        </div>
        <Button onClick={() => setShowSprintForm(true)}>
          <PlusIcon className="h-4 w-4 mr-1" /> New Sprint
        </Button>
      </div>

      <Tabs defaultValue="board">
        <TabsList className="mb-8">
          <TabsTrigger value="board">
            <LayoutDashboardIcon className="h-4 w-4 mr-2" /> Sprint Board
          </TabsTrigger>
          <TabsTrigger value="backlog">
            <ListChecksIcon className="h-4 w-4 mr-2" /> Product Backlog
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <CalendarIcon className="h-4 w-4 mr-2" /> Timeline
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
                      onClick={() => navigate(`/projects/${projectId}/sprint/${sprint.id}`)}
                      size="sm"
                    >
                      View Board
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
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">Timeline Coming Soon</h3>
            <p className="text-muted-foreground">
              This feature will be implemented in a future update.
            </p>
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
    </div>
  );
};

export default ProjectDetailsPage;
