
import { createClient } from '@supabase/supabase-js';
import { ProjectFormData, SprintFormData } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btutiksghrrxrxqxwlnk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dXRpa3NnaHJyeHJ4cXh3bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDk2ODUsImV4cCI6MjA1NjMyNTY4NX0.SSAGtVl0jMLM9v6isoC4oZOZ-Q92nLNZO2RMOUZeyaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Add functions for project management
export async function createProjectInDB(data: ProjectFormData, userId: string) {
  const { data: newProject, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      title: data.title,
      description: data.description,
      end_goal: data.endGoal
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

// Add functions for sprint management
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
