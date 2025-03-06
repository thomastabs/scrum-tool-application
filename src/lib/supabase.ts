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
  console.log("Creating project with user ID:", userId);
  
  if (!userId) {
    console.error("Cannot create project: User ID is null or undefined");
    throw new Error("User ID is required to create a project");
  }
  
  const projectData = {
    owner_id: userId,
    title: data.title,
    description: data.description,
    end_goal: data.endGoal
  };
  
  console.log("Project data to insert:", projectData);
  
  const { data: newProject, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating project:", error);
    throw error;
  } else {
    console.log("Project created successfully:", newProject);
  }
  
  return { data: newProject, error };
}

export async function getProjectsFromDB(userId: string) {
  if (!userId) {
    console.error("Cannot fetch projects: User ID is null or undefined");
    return { data: [], error: new Error("User ID is required to fetch projects") };
  }
  
  console.log("Fetching projects for user ID:", userId);
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching projects:", error);
  } else {
    console.log("Fetched projects:", data);
  }
  
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

// Update sprint functions to work with the fixed foreign key
export async function createSprintInDB(projectId: string, data: SprintFormData, userId: string) {
  // Include the user_id in the sprint creation
  const { data: newSprint, error } = await supabase
    .from('sprints')
    .insert({
      project_id: projectId,
      user_id: userId, // Add user_id to connect to Users table
      title: data.title,
      description: data.description,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      status: 'active',
      justification: data.justification
    })
    .select()
    .single();
  
  return { data: newSprint, error };
}

export async function getSprintsFromDB(userId: string) {
  // Add filter by user_id to match the foreign key constraint
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('user_id', userId)
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
