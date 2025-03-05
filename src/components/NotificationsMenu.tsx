
import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Check, X } from "lucide-react";
import { getPendingInvitations, respondToInvitation } from "@/lib/collaborationService";
import { toast } from "@/components/ui/use-toast";

interface Invitation {
  id: string;
  project_id: string;
  inviter_id: string;
  role: string;
  created_at: string;
  projects: {
    title: string;
  };
}

const NotificationsMenu: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const data = await getPendingInvitations();
      setInvitations(data as unknown as Invitation[]);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
    
    // Set up a polling interval to check for new invitations
    const interval = setInterval(fetchInvitations, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (invitationId: string) => {
    // Immediately remove the invitation from state for responsive UI
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    
    const success = await respondToInvitation(invitationId, "accepted");
    if (success) {
      toast({
        title: "Invitation Accepted",
        description: "You now have access to the project.",
      });
    } else {
      // If the backend request fails, re-fetch to ensure UI is in sync
      fetchInvitations();
    }
  };

  const handleDecline = async (invitationId: string) => {
    // Immediately remove the invitation from state for responsive UI
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    
    const success = await respondToInvitation(invitationId, "declined");
    if (!success) {
      // If the backend request fails, re-fetch to ensure UI is in sync
      fetchInvitations();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {invitations.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {invitations.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Project Invitations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="py-2 px-4 text-center text-sm text-muted-foreground">
            Loading invitations...
          </div>
        ) : invitations.length === 0 ? (
          <div className="py-2 px-4 text-center text-sm text-muted-foreground">
            No pending invitations
          </div>
        ) : (
          <DropdownMenuGroup>
            {invitations.map((invitation) => (
              <div key={invitation.id} className="px-4 py-3 border-b last:border-0 hover:bg-accent">
                <div className="mb-2">
                  <p className="font-medium text-sm">
                    Project: {invitation.projects.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Role: {invitation.role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Received: {new Date(invitation.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={() => handleAccept(invitation.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDecline(invitation.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;
