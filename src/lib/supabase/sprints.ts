
import { SprintFormData } from '@/types';
import { supabase } from './client';

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
      user_id: userData.user.id,
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
    .eq('user_id', userData.user.id)
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
