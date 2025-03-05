
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
import { Bell } from "lucide-react";
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
      setInvitations(data as Invitation[]);
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
    const success = await respondToInvitation(invitationId, "accepted");
    if (success) {
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      toast({
        title: "Invitation Accepted",
        description: "You now have access to the project.",
      });
    }
  };

  const handleDecline = async (invitationId: string) => {
    const success = await respondToInvitation(invitationId, "declined");
    if (success) {
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
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
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="py-2 px-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : invitations.length === 0 ? (
          <div className="py-2 px-4 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        ) : (
          <DropdownMenuGroup>
            {invitations.map((invitation) => (
              <div key={invitation.id} className="px-4 py-2 border-b last:border-0">
                <div className="mb-2">
                  <p className="font-medium text-sm">
                    Project Invitation: {invitation.projects.title}
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
                    variant="default" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleAccept(invitation.id)}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleDecline(invitation.id)}
                  >
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
