
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon } from "lucide-react";
import { Project } from "@/types";
import ProjectForm from "@/components/ProjectForm";

interface ProjectsListProps {
  projects: Project[];
}

const ProjectsList = ({ projects }: ProjectsListProps) => {
  const [showProjectForm, setShowProjectForm] = useState(false);

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-accent/30 rounded-lg border border-border animate-fade-in">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">Welcome to Scrumify Hub</h2>
          <p className="text-muted-foreground mb-6">
            Get started by creating your first project.
          </p>
          <Button onClick={() => setShowProjectForm(true)}>
            <PlusIcon className="h-4 w-4 mr-1" /> Create Project
          </Button>
        </div>

        {showProjectForm && (
          <ProjectForm onClose={() => setShowProjectForm(false)} />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">My Projects</h3>
        <Button onClick={() => setShowProjectForm(true)}>
          <PlusIcon className="h-4 w-4 mr-1" /> New Project
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <Badge variant="outline">
                  {new Date(project.createdAt).toLocaleDateString()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <span className="text-xs text-muted-foreground">End goal:</span>
                <p className="text-sm line-clamp-3">{project.endGoal}</p>
              </div>
              <Button
                className="w-full mt-2"
                asChild
              >
                <Link to={`/my-projects/${project.id}`}>
                  Open Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {showProjectForm && (
        <ProjectForm onClose={() => setShowProjectForm(false)} />
      )}
    </>
  );
};

export default ProjectsList;
