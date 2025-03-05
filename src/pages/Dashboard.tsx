
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject } from "@/context/ProjectContext";
import { signOut, supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ProfileDashboard from "@/components/ProfileDashboard";
import { ExternalLinkIcon, FolderIcon, UsersIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { projects } = useProject();
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUser();
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      navigate("/sign-in");
    }
  };

  // Display recent projects (limited to 3)
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Scrumify Hub</h1>
            <p className="text-muted-foreground mt-2">
              Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">{user?.email}</span>
              <ProfileDashboard user={user} />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FolderIcon className="h-4 w-4" />
                My Projects
              </TabsTrigger>
              <TabsTrigger value="collaborations" className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                My Collaborations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects">
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
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
                </div>
              ) : (
                <div className="text-center py-12 bg-accent/30 rounded-lg border border-border">
                  <FolderIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-4">Start by creating your first agile project</p>
                  <Button asChild>
                    <Link to="/my-projects">Create a Project</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="collaborations">
              <Card>
                <CardHeader>
                  <CardTitle>My Collaborations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Collaboration features will be implemented in the future.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
