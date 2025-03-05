
import React, { useState, useEffect } from "react";
import { getUserPendingInvitations, respondToInvitation } from "@/lib/collaborationService";
import { Invitation } from "@/types/collaboration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Calendar, Check, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const InvitationsList: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const data = await getUserPendingInvitations();
      setInvitations(data);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (id: string, accept: boolean) => {
    try {
      await respondToInvitation(id, accept);
      // Remove the invitation from the list
      setInvitations(invitations.filter(inv => inv.id !== id));
    } catch (error) {
      console.error("Error responding to invitation:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Pending Invitations</h3>
        <p className="text-muted-foreground">
          You don't have any pending project invitations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card key={invitation.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{invitation.projectTitle}</CardTitle>
              <Badge>{invitation.role}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                <span>Invited by {invitation.inviterEmail}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {new Date(invitation.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleResponse(invitation.id, false)}
                className="flex items-center"
              >
                <X className="h-4 w-4 mr-1" /> Decline
              </Button>
              <Button 
                size="sm"
                onClick={() => handleResponse(invitation.id, true)}
                className="flex items-center"
              >
                <Check className="h-4 w-4 mr-1" /> Accept
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InvitationsList;
