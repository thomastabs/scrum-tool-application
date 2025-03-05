import { createClient } from '@supabase/supabase-js';
import { ProjectFormData, SprintFormData } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btutiksghrrxrxqxwlnk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dXRpa3NnaHJyeHJ4cXh3bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDk2ODUsImV4cCI6MjA1NjMyNTY4NX0.SSAGtVl0jMLM9v6isoC4oZOZ-Q92nLNZO2RMOUZeyaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    }
  });
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

// Project management functions
export async function createProjectInDB(data: ProjectFormData, userId: string) {
  const { data: newProject, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      title: data.title,
      description: data.description,
      end_goal: data.endGoal,
      collaborators: []
    })
    .select()
    .single();
  
  return { data: newProject, error };
}

export async function getProjectsFromDB() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function getCollaboratedProjectsFromDB() {
  // Get the current user ID
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  
  if (!userId) {
    return { data: [], error: new Error('No authenticated user found') };
  }

  // Query projects where current user is a collaborator
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .contains('collaborators', [userId])
    .not('user_id', 'eq', userId) // Exclude projects owned by the user
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function updateProjectInDB(id: string, data: ProjectFormData) {
  const { data: updatedProject, error } = await supabase
    .from('projects')
    .update({
      title: data.title,
      description: data.description,
      end_goal: data.endGoal,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data: updatedProject, error };
}

export async function deleteProjectFromDB(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Collaboration management functions
export async function inviteUserToProject(projectId: string, userId: string, role: string = 'collaborator') {
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      project_id: projectId,
      invited_user_id: userId,
      inviter_id: (await supabase.auth.getUser()).data.user?.id,
      role: role,
      status: 'pending'
    })
    .select()
    .single();
  
  return { data, error };
}

export async function getPendingInvitations() {
  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      projects:project_id (title, description),
      inviters:inviter_id (email)
    `)
    .eq('status', 'pending');
  
  return { data, error };
}

export async function respondToInvitation(invitationId: string, status: 'accepted' | 'declined') {
  const { data, error } = await supabase
    .from('invitations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', invitationId)
    .select()
    .single();
  
  return { data, error };
}

export async function searchUsers(query: string) {
  if (!query || query.length < 3) {
    return { data: [], error: null };
  }
  
  const { data, error } = await supabase
    .from('user_profiles') // Assumes there's a user_profiles view or table
    .select('id, email, display_name')
    .ilike('email', `%${query}%`)
    .limit(10);
  
  return { data, error };
}

// Sprint management functions
export async function createSprintInDB(projectId: string, data: SprintFormData) {
  const { data: newSprint, error } = await supabase
    .from('sprints')
    .insert({
      project_id: projectId,
      title: data.title,
      description: data.description,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      is_completed: false,
      justification: data.justification
    })
    .select()
    .single();
  
  return { data: newSprint, error };
}

export async function getSprintsFromDB() {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function updateSprintInDB(id: string, data: SprintFormData) {
  const { data: updatedSprint, error } = await supabase
    .from('sprints')
    .update({
      title: data.title,
      description: data.description,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      justification: data.justification,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data: updatedSprint, error };
}

export async function completeSprintInDB(id: string) {
  const { data, error } = await supabase
    .from('sprints')
    .update({
      is_completed: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteSprintFromDB(id: string) {
  const { error } = await supabase
    .from('sprints')
    .delete()
    .eq('id', id);
  
  return { error };
}
