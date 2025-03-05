
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject } from "@/context/ProjectContext";
import { signOut, supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import ProfileDashboard from "@/components/ProfileDashboard";
import { ExternalLinkIcon, FolderIcon, UsersIcon, BellIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserCollaborations, getUserPendingInvitations } from "@/lib/collaborationService";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { projects } = useProject();
  const [user, setUser] = useState<any>(null);
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUser();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch collaborations and invitations in parallel
      const [collaborationsData, invitationsData] = await Promise.all([
        getUserCollaborations(),
        getUserPendingInvitations()
      ]);
      
      setCollaborations(collaborationsData);
      setPendingInvitations(invitationsData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

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
            {pendingInvitations.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="relative" 
                onClick={() => navigate("/invitations")}
              >
                <BellIcon className="h-4 w-4 mr-1" />
                Invitations
                <Badge 
                  className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs" 
                  variant="destructive"
                >
                  {pendingInvitations.length}
                </Badge>
              </Button>
            )}
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
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : collaborations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collaborations.map((collab) => (
                    <Card key={collab.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-xl">{collab.project.title}</CardTitle>
                          <Badge>{collab.role}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {collab.project.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <Button size="sm" variant="default" asChild className="w-full">
                          <Link to={`/my-projects/${collab.project.id}`}>
                            Open Project
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-accent/30 rounded-lg border border-border">
                  <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No collaborations yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You will see projects shared with you here when you accept invitations
                  </p>
                  {pendingInvitations.length > 0 && (
                    <Button asChild>
                      <Link to="/invitations">View Invitations ({pendingInvitations.length})</Link>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
