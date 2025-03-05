
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
import { ExternalLinkIcon } from "lucide-react";

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
          {/* Recent Projects Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Projects</CardTitle>
                <Button size="sm" asChild>
                  <Link to="/my-projects">
                    View All Projects
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-accent/50 transition-colors">
                      <div>
                        <h3 className="font-medium">{project.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/my-projects/${project.id}`}>
                          <ExternalLinkIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No projects yet.</p>
                  <Button asChild>
                    <Link to="/my-projects">Create a Project</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
