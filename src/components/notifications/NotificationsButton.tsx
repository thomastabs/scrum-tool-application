
import React, { useState, useEffect } from "react";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPendingInvitations, respondToInvitation } from "@/lib/supabase";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const NotificationsButton = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  
  const loadInvitations = async () => {
    const { data, error } = await getPendingInvitations();
    if (error) {
      console.error("Error loading invitations:", error);
      return;
    }
    setInvitations(data || []);
  };

  useEffect(() => {
    loadInvitations();
    
    // Set up a polling mechanism to check for new invitations
    const interval = setInterval(loadInvitations, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleInvitationResponse = async (id: string, accept: boolean) => {
    const status = accept ? 'accepted' : 'declined';
    const { error } = await respondToInvitation(id, status);
    
    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} invitation: ${error.message}`,
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: accept ? "Invitation Accepted" : "Invitation Declined",
      description: accept 
        ? "You have been added to the project" 
        : "You have declined the invitation"
    });
    
    // Refresh the invitations list
    setInvitations(invitations.filter(inv => inv.id !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <BellIcon className="h-5 w-5" />
          {invitations.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
            >
              {invitations.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-96 overflow-auto">
        <div className="p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
        </div>
        
        {invitations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="divide-y">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="p-4">
                <p className="font-medium mb-1">Project Invitation</p>
                <p className="text-sm mb-2">
                  You've been invited to join project "{invitation.projects.title}" by {invitation.inviters.email}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handleInvitationResponse(invitation.id, true)}
                  >
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleInvitationResponse(invitation.id, false)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsButton;
