import { createClient } from '@supabase/supabase-js';
import { ProjectFormData, SprintFormData } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cgbjynxpgpriccapjbed.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYmp5bnhwZ3ByaWNjYXBqYmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNzQxMTAsImV4cCI6MjA1Njg1MDExMH0.UYJAgQ9X_hYwQ-8pGmIlAD_9q_DuF2t365xQA9_m4iE';

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
export async function createProjectInDB(data: ProjectFormData) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data: newProject, error } = await supabase
    .from('projects')
    .insert({
      owner_id: userData.user.id, // Using auth.users.id
      title: data.title,
      description: data.description,
      end_goal: data.endGoal
    })
    .select()
    .single();
  
  return { data: newProject, error };
}

export async function getProjectsFromDB() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userData.user.id) // Filter by the user's ID
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function updateProjectInDB(id: string, data: ProjectFormData) {
  const { data: updatedProject, error } = await supabase
    .from('projects')
    .update({
      title: data.title,
      description: data.description,
      end_goal: data.endGoal
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

export async function deleteAllProjectsFromDB() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: new Error('User not authenticated') };
  }

  // First, delete all sprints associated with the user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', userData.user.id);
  
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
      .eq('owner_id', userData.user.id);
    
    return { error };
  }
  
  return { error: null };
}

// Add functions for sprint management
export async function createSprintInDB(projectId: string, data: SprintFormData) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  // First, create the sprint
  const { data: newSprint, error } = await supabase
    .from('sprints')
    .insert({
      project_id: projectId,
      user_id: userData.user.id, // Using auth.users.id
      title: data.title,
      description: data.description,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      duration: Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)) // Calculate duration in days
    })
    .select()
    .single();
  
  if (error || !newSprint) {
    return { data: null, error: error || new Error('Failed to create sprint') };
  }
  
  // Then create the default columns
  const defaultColumns = [
    { title: 'TO DO', position: 0, is_default: true },
    { title: 'IN PROGRESS', position: 1, is_default: true },
    { title: 'DONE', position: 2, is_default: true }
  ];
  
  // Create the columns
  for (const column of defaultColumns) {
    await supabase
      .from('kanban_columns')
      .insert({
        sprint_id: newSprint.id,
        title: column.title,
        position: column.position,
        is_default: column.is_default
      });
  }
  
  return { data: newSprint, error: null };
}

export async function getSprintsFromDB() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('user_id', userData.user.id) // Filter by the user's ID
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
      duration: Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)) // Calculate duration in days
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
      status: 'completed'
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

export async function getColumnsForSprint(sprintId: string) {
  const { data, error } = await supabase
    .from('kanban_columns')
    .select('*')
    .eq('sprint_id', sprintId)
    .order('position', { ascending: true });
  
  return { data, error };
}

export async function createColumnInDB(sprintId: string, title: string) {
  // Get the highest position value
  const { data: columns } = await supabase
    .from('kanban_columns')
    .select('position')
    .eq('sprint_id', sprintId)
    .order('position', { ascending: false })
    .limit(1);
  
  const position = columns && columns.length > 0 ? columns[0].position + 1 : 0;
  
  const { data: newColumn, error } = await supabase
    .from('kanban_columns')
    .insert({
      sprint_id: sprintId,
      title,
      position,
      is_default: false
    })
    .select()
    .single();
  
  return { data: newColumn, error };
}

export async function deleteColumnFromDB(columnId: string) {
  // Check if it's a default column
  const { data: column } = await supabase
    .from('kanban_columns')
    .select('is_default')
    .eq('id', columnId)
    .single();
  
  if (column && column.is_default) {
    return { error: new Error('Cannot delete default columns') };
  }
  
  const { error } = await supabase
    .from('kanban_columns')
    .delete()
    .eq('id', columnId);
  
  return { error };
}
