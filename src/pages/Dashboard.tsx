
import React from "react";
import { Button } from "@/components/ui/button";
import { signOut, supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ProfileDashboard from "@/components/ProfileDashboard";

const Dashboard = () => {
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
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Scrumify Hub</h2>
            <p className="text-muted-foreground mb-6">Your personal project management dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
