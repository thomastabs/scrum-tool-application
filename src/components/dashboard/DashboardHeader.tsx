
import React from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import ProfileDashboard from "@/components/ProfileDashboard";
import { RefreshCcw } from "lucide-react";

interface DashboardHeaderProps {
  user: any;
  onRefresh?: () => void;
}

const DashboardHeader = ({ user, onRefresh }: DashboardHeaderProps) => {
  const navigate = useNavigate();

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
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">Scrumify Hub</h1>
        <p className="text-muted-foreground mt-2">Dashboard</p>
      </div>
      <div className="flex items-center gap-4">
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
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
  );
};

export default DashboardHeader;
