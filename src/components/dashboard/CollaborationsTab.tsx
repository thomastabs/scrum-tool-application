
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Project } from "@/types";

const CollaborationsTab = () => {
  const [collaborations, setCollaborations] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCollaborations() {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;
        
        if (!userId) {
          return;
        }
        
        // Get projects where the user is a collaborator but not the owner
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .neq('user_id', userId)
          .contains('collaborators', [userId]);
        
        if (error) {
          throw error;
        }
        
        setCollaborations(data || []);
      } catch (error) {
        console.error("Error fetching collaborations:", error);
        toast({
          title: "Error",
          description: "Failed to load collaborations. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCollaborations();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Collaborations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (collaborations.length === 0) {
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
              You haven't been added as a collaborator to any projects yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Collaborations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collaborations.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              </CardHeader>
              <CardContent>
                <Button size="sm" variant="default" asChild className="w-full">
                  <Link to={`/my-projects/${project.id}`}>Open Project</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CollaborationsTab;
