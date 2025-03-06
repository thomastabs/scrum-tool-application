// Fix this component to correctly pass sprintId to SprintColumn
// Also fix the issue with Sprint type not matching required description property
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { Project, Sprint } from "@/types";
import SprintForm from "./SprintForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  CheckCircleIcon,
  Clock9Icon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { formatDistanceToNow, format, isAfter, isBefore } from "date-fns";
import SprintColumn from "./sprint/SprintColumn";

interface ProjectProps {
  project: Project;
}

const ProjectComponent: React.FC<ProjectProps> = ({ project }) => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { sprints, deleteProject } = useProject();
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null);

  if (!projectId) {
    return <div>Error: Missing projectId</div>;
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

  const now = new Date();

  const upcomingSprints = projectSprints.filter((sprint) =>
    isAfter(new Date(sprint.endDate), now)
  );
  const currentSprints = projectSprints.filter(
    (sprint) =>
      isBefore(new Date(sprint.startDate), now) &&
      isAfter(new Date(sprint.endDate), now)
  );
  const pastSprints = projectSprints.filter((sprint) =>
    isBefore(new Date(sprint.endDate), now)
  );

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <Button
        variant="ghost"
        onClick={() => navigate("/?tab=projects")}
        className="mb-6"
      >
        ← Back to Projects
      </Button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/projects/${project.id}/edit`)}
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
          {project.endGoal && (
            <Badge variant="secondary" className="mt-4">
              Goal: {project.endGoal}
            </Badge>
          )}
        </div>
        <Button onClick={() => setShowSprintForm(true)}>
          <PlusIcon className="h-4 w-4 mr-1" /> New Sprint
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <Clock9Icon className="h-4 w-4 mr-2 inline-block" /> Current Sprints
          </CardTitle>
          <CardDescription>Sprints currently in progress.</CardDescription>
        </CardHeader>
        <CardContent>
          {currentSprints.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentSprints.map((sprint) => (
                <SprintColumn sprintId={sprint.id} key={sprint.id} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No current sprints.
            </div>
          )}
        </CardContent>
        {currentSprints.length > 0 && (
          <CardFooter className="text-right">
            <Button>View All Current Sprints</Button>
          </CardFooter>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                <CalendarIcon className="h-4 w-4 mr-2 inline-block" /> Upcoming
                Sprints
              </CardTitle>
              <CardDescription>
                Sprints scheduled for the future.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSprints.length > 0 ? (
                <ul className="list-none p-0">
                  {upcomingSprints.map((sprint) => (
                    <li
                      key={sprint.id}
                      className="py-2 border-b border-gray-200 last:border-none"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{sprint.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(sprint.startDate), "MMM d, yyyy")} -{" "}
                            {format(new Date(sprint.endDate), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSprint(sprint)}
                        >
                          Edit
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No upcoming sprints.
                </div>
              )}
            </CardContent>
            {upcomingSprints.length > 0 && (
              <CardFooter className="text-right">
                <Button>View All Upcoming Sprints</Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                <CheckCircleIcon className="h-4 w-4 mr-2 inline-block" /> Past
                Sprints
              </CardTitle>
              <CardDescription>Completed sprints.</CardDescription>
            </CardHeader>
            <CardContent>
              {pastSprints.length > 0 ? (
                <ul className="list-none p-0">
                  {pastSprints.map((sprint) => (
                    <li
                      key={sprint.id}
                      className="py-2 border-b border-gray-200 last:border-none"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{sprint.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(sprint.endDate), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSprint(sprint)}
                        >
                          Edit
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No past sprints.
                </div>
              )}
            </CardContent>
            {pastSprints.length > 0 && (
              <CardFooter className="text-right">
                <Button>View All Past Sprints</Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      {showSprintForm && (
        <SprintForm
          onClose={() => {
            setShowSprintForm(false);
            setSprintToEdit(null);
          }}
          sprintToEdit={sprintToEdit ? {
            id: sprintToEdit.id,
            title: sprintToEdit.title,
            description: sprintToEdit.description || "",
            startDate: sprintToEdit.startDate,
            endDate: sprintToEdit.endDate,
          } : null}
        />
      )}
    </div>
  );
};

export default ProjectComponent;
