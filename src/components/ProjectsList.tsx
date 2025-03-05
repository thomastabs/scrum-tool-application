
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types";
import { getCollaborativeProjects } from "@/lib/collaborationService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectsListProps {
  projects: Project[];
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects }) => {
  const [collaborativeProjects, setCollaborativeProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollaborativeProjects = async () => {
      setLoading(true);
      const data = await getCollaborativeProjects();
      setCollaborativeProjects(data);
      setLoading(false);
    };

    fetchCollaborativeProjects();
  }, []);

  const renderProjects = (projectsList: Project[], isCollaborative = false) => {
    if (projectsList.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">
            {isCollaborative 
              ? "No Collaborative Projects" 
              : "No Projects Created Yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {isCollaborative 
              ? "You haven't been added to any projects as a collaborator." 
              : "Create your first project to get started."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsList.map((project) => (
          <Card 
            key={project.id} 
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>
                {isCollaborative ? "Collaborative Project" : "Your Project"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-3">
                {project.description}
              </p>
            </CardContent>
            <CardFooter>
              <Link 
                to={`/my-projects/${project.id}`} 
                className="w-full"
              >
                <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md">
                  View Project
                </button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="owned">
      <TabsList className="mb-6">
        <TabsTrigger value="owned">My Projects</TabsTrigger>
        <TabsTrigger value="collaborative">Collaborations</TabsTrigger>
      </TabsList>
      
      <TabsContent value="owned" className="animate-fade-in">
        {renderProjects(projects)}
      </TabsContent>
      
      <TabsContent value="collaborative" className="animate-fade-in">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          renderProjects(collaborativeProjects, true)
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ProjectsList;
