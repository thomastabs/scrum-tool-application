
import { ProjectFormData } from '@/types';
import { supabase } from './client';

export async function createProjectInDB(data: ProjectFormData) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data: newProject, error } = await supabase
    .from('projects')
    .insert({
      owner_id: userData.user.id,
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
    .eq('owner_id', userData.user.id)
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
