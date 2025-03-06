
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FolderIcon, RefreshCwIcon } from "lucide-react";
import { signOut } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface DashboardHeaderProps {
  user: any;
  onRefresh?: () => void;
}

const DashboardHeader = ({ user, onRefresh }: DashboardHeaderProps) => {
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center">
        <FolderIcon className="h-8 w-8 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            title="Refresh projects"
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
        <div className="flex items-center gap-2">
          {user && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <div className="text-sm font-medium">{user?.email || "User"}</div>
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs text-muted-foreground"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
