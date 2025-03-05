import { supabase } from "@/lib/supabase";
import { Project } from "@/types";
import { toast } from "@/components/ui/use-toast";

// Get projects where user is a collaborator
export async function getCollaborativeProjects(): Promise<Project[]> {
  try {
    const { data: collaborations, error } = await supabase
      .from('collaborators')
      .select(`
        project_id,
        projects:project_id (*)
      `)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
    
    if (error) {
      console.error("Error fetching collaborative projects:", error);
      toast({
        title: "Error",
        description: "Failed to load collaborative projects",
        variant: "destructive",
      });
      return [];
    }
    
    if (!collaborations || collaborations.length === 0) {
      return [];
    }
    
    // Transform the data to match the Project interface
    const projects = collaborations.map(collab => {
      const projectData = collab.projects as unknown as any;
      return {
        id: projectData.id,
        title: projectData.title,
        description: projectData.description || "",
        endGoal: projectData.end_goal || "",
        createdAt: new Date(projectData.created_at),
        updatedAt: new Date(projectData.updated_at || projectData.created_at),
        user_id: projectData.user_id,
      };
    });
    
    return projects;
  } catch (error) {
    console.error("Error in getCollaborativeProjects:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
    return [];
  }
}

// Get pending invitations for the current user
export async function getPendingInvitations() {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      return [];
    }
    
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        id,
        project_id,
        inviter_id,
        role,
        created_at,
        projects:projects(title)
      `)
      .eq('invited_email', user.email)
      .eq('status', 'pending');
    
    if (error) {
      console.error("Error fetching invitations:", error);
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
      return [];
    }
    
    return invitations || [];
  } catch (error) {
    console.error("Error in getPendingInvitations:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
    return [];
  }
}

// Respond to an invitation (accept or decline)
export async function respondToInvitation(invitationId: string, status: 'accepted' | 'declined') {
  try {
    const { error } = await supabase
      .from('invitations')
      .update({ status })
      .eq('id', invitationId);
    
    if (error) {
      console.error("Error responding to invitation:", error);
      toast({
        title: "Error",
        description: `Failed to ${status} invitation`,
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Success",
      description: `Invitation ${status} successfully`,
    });
    
    return true;
  } catch (error) {
    console.error("Error in respondToInvitation:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
    return false;
  }
}
