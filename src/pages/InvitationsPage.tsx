
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import InvitationsList from "@/components/InvitationsList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { respondToInvitation } from "@/lib/collaborationService";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const InvitationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invitationId = searchParams.get("id");
  const action = searchParams.get("action");

  useEffect(() => {
    // Check if we're coming from an email link with action and ID
    if (invitationId && (action === "accept" || action === "decline")) {
      handleInvitationResponse();
    }
  }, [invitationId, action]);

  const handleInvitationResponse = async () => {
    try {
      // Make sure user is authenticated
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        // Store the invitation response intention and redirect to sign in
        localStorage.setItem("pendingInvitationAction", JSON.stringify({
          id: invitationId,
          action: action
        }));
        navigate("/sign-in");
        return;
      }

      // Process the invitation
      if (invitationId) {
        await respondToInvitation(invitationId, action === "accept");
        
        // Redirect to remove query params
        navigate("/invitations");
      }
    } catch (error: any) {
      console.error("Error processing invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process invitation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-6">
          <Button variant="ghost" asChild className="pl-0">
            <span onClick={() => navigate("/")} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </span>
          </Button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Invitations</h1>
          <p className="text-muted-foreground mt-2">
            Manage your project collaboration invitations
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InvitationsList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvitationsPage;
