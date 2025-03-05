
import { supabase } from "./supabase";
import { Collaborator, Invitation, InvitationFormData } from "@/types/collaboration";
import { toast } from "@/components/ui/use-toast";

// Fetch collaborations for current user
export async function getUserCollaborations() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data, error } = await supabase
    .from("collaborators")
    .select(`
      id, 
      project_id,
      role,
      created_at,
      projects:project_id (
        id,
        title,
        description,
        user_id
      )
    `)
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching collaborations:", error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    projectId: item.project_id,
    role: item.role,
    createdAt: new Date(item.created_at),
    project: item.projects
  }));
}

// Fetch collaborators for a project
export async function getProjectCollaborators(projectId: string) {
  const { data, error } = await supabase
    .from("collaborators")
    .select(`
      id, 
      project_id,
      user_id,
      role,
      created_at,
      users:user_id (
        email
      )
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching collaborators:", error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    projectId: item.project_id,
    userId: item.user_id,
    role: item.role,
    createdAt: new Date(item.created_at),
    userEmail: item.users?.email
  })) as Collaborator[];
}

// Send invitation
export async function sendInvitation(data: InvitationFormData) {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error("User not authenticated");
    }

    // Get project details
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("title")
      .eq("id", data.projectId)
      .single();

    if (projectError || !projectData) {
      throw new Error("Project not found");
    }

    // Create invitation record
    const { data: invitation, error } = await supabase
      .from("invitations")
      .insert({
        project_id: data.projectId,
        invited_email: data.email,
        role: data.role,
        inviter_id: userData.user.id,
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("This user has already been invited to this project");
      }
      throw error;
    }

    // Call edge function to send email
    const response = await supabase.functions.invoke("send-invitation-email", {
      body: {
        to: data.email,
        projectTitle: projectData.title,
        inviterEmail: userData.user.email,
        projectId: data.projectId,
        role: data.role,
        invitationId: invitation.id
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${data.email}`
    });

    return invitation;
  } catch (error: any) {
    toast({
      title: "Error sending invitation",
      description: error.message,
      variant: "destructive"
    });
    throw error;
  }
}

// Get pending invitations for current user
export async function getUserPendingInvitations() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data, error } = await supabase
    .from("invitations")
    .select(`
      id, 
      project_id,
      invited_email,
      role,
      inviter_id,
      status,
      created_at,
      updated_at,
      projects:project_id (
        title
      ),
      users:inviter_id (
        email
      )
    `)
    .eq("invited_email", user.user.email)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invitations:", error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    projectId: item.project_id,
    invitedEmail: item.invited_email,
    role: item.role,
    inviterId: item.inviter_id,
    status: item.status,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    projectTitle: item.projects?.title,
    inviterEmail: item.users?.email
  })) as Invitation[];
}

// Respond to invitation
export async function respondToInvitation(invitationId: string, accept: boolean) {
  try {
    const status = accept ? "accepted" : "declined";
    
    const { error } = await supabase
      .from("invitations")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", invitationId);

    if (error) {
      throw error;
    }

    toast({
      title: accept ? "Invitation accepted" : "Invitation declined",
      description: accept 
        ? "You have been added to the project"
        : "The invitation has been declined"
    });

    return true;
  } catch (error: any) {
    toast({
      title: "Error responding to invitation",
      description: error.message,
      variant: "destructive"
    });
    throw error;
  }
}
