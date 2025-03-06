
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import ProjectForm from "@/components/ProjectForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ProjectsPage = () => {
  const { projects } = useProject();
  const [showProjectForm, setShowProjectForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground mt-2">
              Manage your agile projects with ease
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowProjectForm(true)}>
              <PlusIcon className="h-4 w-4 mr-1" /> New Project
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Button variant="ghost" asChild className="pl-0">
            <Link to="/">
              ← Back to Dashboard
            </Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-accent/30 rounded-lg border border-border animate-fade-in">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold mb-2">Welcome to Scrumify Hub</h2>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first project.
              </p>
              <Button onClick={() => setShowProjectForm(true)}>
                <PlusIcon className="h-4 w-4 mr-1" /> Create Project
              </Button>
            </div>
          </div>
        ) : (
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
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <span className="text-xs text-muted-foreground">End goal:</span>
                    <p className="text-sm line-clamp-3">{project.endGoal}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    asChild
                  >
                    <Link to={`/my-projects/${project.id}`}>
                      Open Project
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showProjectForm && (
        <ProjectForm onClose={() => setShowProjectForm(false)} />
      )}
    </div>
  );
};

export default ProjectsPage;
