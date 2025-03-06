import { createClient } from '@supabase/supabase-js';
import { ProjectFormData, SprintFormData } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btutiksghrrxrxqxwlnk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dXRpa3NnaHJyeHJ4cXh3bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDk2ODUsImV4cCI6MjA1NjMyNTY4NX0.SSAGtVl0jMLM9v6isoC4oZOZ-Q92nLNZO2RMOUZeyaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export type SignUpFormData = {
  email: string;
  password: string;
  fullName: string;
  role: 'scrum_master' | 'worker' | 'project_manager' | 'tester';
};

export type SignInFormData = {
  email: string;
  password: string;
};

export async function signUp(data: SignUpFormData) {
  const { email, password, fullName, role } = data;
  
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
}

export async function signIn(data: SignInFormData) {
  const { email, password } = data;
  
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getUserProfile() {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) return { data: null, error: null };
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();
    
  return { data, error, user: authData.user };
}

// Project functions
export async function createProjectInDB(data: ProjectFormData) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: { message: "Not authenticated" }, data: null };
  }

  const { data: newProject, error } = await supabase
    .from('projects')
    .insert({
      owner_id: user.id,
      title: data.title,
      description: data.description,
      end_goal: data.endGoal
    })
    .select()
    .single();
  
  return { data: newProject, error };
}

export async function getProjectsFromDB() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: { message: "Not authenticated" }, data: null };
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function updateProjectInDB(id: string, data: ProjectFormData) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: { message: "Not authenticated" }, data: null };
  }

  const { data: updatedProject, error } = await supabase
    .from('projects')
    .update({
      title: data.title,
      description: data.description,
      end_goal: data.endGoal
    })
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single();
  
  return { data: updatedProject, error };
}

export async function deleteProjectFromDB(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: { message: "Not authenticated" }, data: null };
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);
  
  return { error };
}

export async function deleteAllProjectsFromDB() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: { message: "Not authenticated" }, data: null };
  }

  // First, delete all sprints associated with the user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', user.id);
  
  if (projects && projects.length > 0) {
    const projectIds = projects.map(project => project.id);
    
    // Delete all sprints associated with these projects
    await supabase
      .from('sprints')
      .delete()
      .in('project_id', projectIds);
    
    // Delete all projects
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('owner_id', user.id);
    
    return { error };
  }
  
  return { error: null };
}

// Sprint functions
export async function createSprintInDB(projectId: string, data: SprintFormData) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: { message: "Not authenticated" }, data: null };
  }

  const { data: newSprint, error } = await supabase
    .from('sprints')
    .insert({
      project_id: projectId,
      user_id: user.id,
      title: data.title,
      description: data.description,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      duration: Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)) // Calculate duration in days
    })
    .select()
    .single();
  
  return { data: newSprint, error };
}

export async function getSprintsFromDB() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: { message: "Not authenticated" }, data: null };
  }

  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function updateSprintInDB(id: string, data: SprintFormData) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: { message: "Not authenticated" }, data: null };
  }

  const { data: updatedSprint, error } = await supabase
    .from('sprints')
    .update({
      title: data.title,
      description: data.description,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      duration: Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)) // Calculate duration in days
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  
  return { data: updatedSprint, error };
}

export async function completeSprintInDB(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: { message: "Not authenticated" }, data: null };
  }

  const { data, error } = await supabase
    .from('sprints')
    .update({
      status: 'completed'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteSprintFromDB(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: { message: "Not authenticated" }, data: null };
  }

  const { error } = await supabase
    .from('sprints')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  return { error };
}
