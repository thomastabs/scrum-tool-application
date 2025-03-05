
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersIcon } from "lucide-react";
import { getCollaboratedProjectsFromDB, supabase } from "@/lib/supabase";
import { Project } from "@/types";

const CollaborationsTab = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollaborations = async () => {
      setLoading(true);
      const { data, error } = await getCollaboratedProjectsFromDB();
      
      if (error) {
        console.error("Error loading collaborations:", error);
        setProjects([]);
      } else {
        setProjects(data || []);
      }
      
      setLoading(false);
    };

    loadCollaborations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Collaborations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No collaborations yet</h3>
            <p className="text-muted-foreground">
              You haven't been invited to collaborate on any projects yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Projects I'm Collaborating On</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
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
    </div>
  );
};

export default CollaborationsTab;
