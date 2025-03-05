
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import ProjectForm from "@/components/ProjectForm";
import InvitationForm from "@/components/InvitationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, LogOut, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase, signOut } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import ProfileDashboard from "@/components/ProfileDashboard";
import { getUserPendingInvitations } from "@/lib/collaborationService";

const ProjectsPage = () => {
  const { projects } = useProject();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showInvitationForm, setShowInvitationForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [invitationCount, setInvitationCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUser();
    fetchInvitationCount();
  }, []);

  const fetchInvitationCount = async () => {
    try {
      const invitations = await getUserPendingInvitations();
      setInvitationCount(invitations.length);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  const handleInviteClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowInvitationForm(true);
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
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground mt-2">
              Manage your agile projects with ease
            </p>
          </div>
          <div className="flex items-center gap-4">
            {invitationCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="relative" 
                onClick={() => navigate("/invitations")}
              >
                Invitations
                <Badge 
                  className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs" 
                  variant="destructive"
                >
                  {invitationCount}
                </Badge>
              </Button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm">{user?.email}</span>
              <ProfileDashboard user={user} />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </div>
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
                <CardFooter className="flex flex-col space-y-2">
                  <Button
                    className="w-full"
                    asChild
                  >
                    <Link to={`/my-projects/${project.id}`}>
                      Open Project
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleInviteClick(project.id)}
                  >
                    <UsersIcon className="h-4 w-4 mr-1" /> Invite Collaborators
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

      {showInvitationForm && selectedProjectId && (
        <InvitationForm 
          projectId={selectedProjectId} 
          onClose={() => {
            setShowInvitationForm(false);
            setSelectedProjectId(null);
          }} 
        />
      )}
    </div>
  );
};

export default ProjectsPage;
