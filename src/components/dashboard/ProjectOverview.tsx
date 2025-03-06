
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderIcon } from "lucide-react";
import { Project } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectOverviewProps {
  projects: Project[];
  loading: boolean;
}

const ProjectOverview = ({ projects, loading }: ProjectOverviewProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Display recent projects (limited to 3)
  const recentProjects = projects.slice(0, 3);

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-accent/30 rounded-lg border border-border">
        <FolderIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No projects yet</h3>
        <p className="text-muted-foreground mb-4">Start by creating your first agile project</p>
        <Button asChild>
          <Link to="/?tab=projects">Create a Project</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recentProjects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-xl">{project.title}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="default" asChild className="w-full">
              <Link to={`/my-projects/${project.id}`}>
                Open Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
      {projects.length > 3 && (
        <Card className="hover:shadow-md transition-shadow flex items-center justify-center">
          <CardContent className="py-6">
            <Button variant="outline" asChild>
              <Link to="/?tab=projects">
                View All Projects
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectOverview;
