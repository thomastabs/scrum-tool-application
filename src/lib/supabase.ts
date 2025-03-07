import { createClient } from '@supabase/supabase-js';
import { ProjectFormData, SprintFormData, TaskFormData, BacklogItemFormData } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btutiksghrrxrxqxwlnk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dXRpa3NnaHJyeHJ4cXh3bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDk2ODUsImV4cCI6MjA1NjMyNTY4NX0.SSAGtVl0jMLM9v6isoC4oZOZ-Q92nLNZO2RMOUZeyaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export async function signUp(email: string, password: string) {
  try {
    // Log the signup attempt for debugging
    console.log(`Attempting to sign up user with email: ${email}`);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      }
    });
    
    if (error) {
      console.error("Supabase signup error:", error);
      // Return the specific error from Supabase
      return { data: null, error };
    }
    
    console.log("Signup successful, response data:", data);
    return { data, error: null };
  } catch (err: any) {
    // Log the full error object for debugging
    console.error("Unexpected error in signUp function:", err);
    
    // Try to extract useful info from the error
    const errorMessage = err?.message || "An unexpected error occurred during sign up.";
    const errorDetails = err?.details || err?.error_description || "";
    
    return { 
      data: null, 
      error: { 
        message: `${errorMessage}${errorDetails ? `: ${errorDetails}` : ""}`,
        status: err?.status || 500
      } 
    };
  }
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
export async function createProjectInDB(data: ProjectFormData) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data: newProject, error } = await supabase
    .from('projects')
    .insert({
      owner_id: userData.user.id, // This links the project to the user
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
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data: updatedProject, error } = await supabase
    .from('projects')
    .update({
      title: data.title,
      description: data.description,
      end_goal: data.endGoal
    })
    .eq('id', id)
    .eq('owner_id', userData.user.id) // Ensure user can only update their own projects
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

// Sprint management functions
export async function createSprintInDB(data: SprintFormData) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data: newSprint, error } = await supabase
    .from('sprints')
    .insert({
      project_id: data.projectId,
      title: data.title,
      description: data.description,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      status: 'planned'
    })
    .select()
    .single();
  
  return { data: newSprint, error };
}

export async function getSprintsFromDB() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

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
      end_date: data.endDate.toISOString()
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
  // First delete all related columns and tasks
  await supabase.from('board_columns').delete().eq('sprint_id', id);
  await supabase.from('tasks').delete().eq('sprint_id', id);
  
  // Then delete the sprint
  const { error } = await supabase
    .from('sprints')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Column management functions
export async function createColumnInDB(title: string, sprintId: string, orderIndex: number) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data: newColumn, error } = await supabase
    .from('board_columns')
    .insert({
      sprint_id: sprintId,
      title: title,
      order_index: orderIndex
    })
    .select()
    .single();
  
  return { data: newColumn, error };
}

export async function getColumnsFromDB() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('board_columns')
    .select('*')
    .order('order_index', { ascending: true });
  
  return { data, error };
}

export async function deleteColumnFromDB(id: string) {
  // First delete all tasks in this column
  await supabase.from('tasks').delete().eq('column_id', id);
  
  // Then delete the column
  const { error } = await supabase
    .from('board_columns')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Task management functions
export async function createTaskInDB(data: TaskFormData, sprintId: string, columnId: string, projectId: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data: newTask, error } = await supabase
    .from('tasks')
    .insert({
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      story_points: data.storyPoints,
      assignee: data.assignee,
      sprint_id: sprintId,
      column_id: columnId,
      project_id: projectId,
      status: 'to_do'
    })
    .select()
    .single();
  
  return { data: newTask, error };
}

export async function getTasksFromDB() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*');
  
  return { data, error };
}

export async function updateTaskInDB(id: string, data: TaskFormData) {
  const { data: updatedTask, error } = await supabase
    .from('tasks')
    .update({
      title: data.title,
      description: data.description,
      priority: data.priority,
      story_points: data.storyPoints,
      assignee: data.assignee
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data: updatedTask, error };
}

export async function moveTaskToColumnInDB(taskId: string, targetColumnId: string) {
  // Get the target column to determine its status
  const { data: columnData } = await supabase
    .from('board_columns')
    .select('title')
    .eq('id', targetColumnId)
    .single();
  
  let status = 'to_do';
  if (columnData) {
    if (columnData.title === 'IN PROGRESS') {
      status = 'in_progress';
    } else if (columnData.title === 'DONE') {
      status = 'done';
    }
  }

  const { data: updatedTask, error } = await supabase
    .from('tasks')
    .update({
      column_id: targetColumnId,
      status: status
    })
    .eq('id', taskId)
    .select()
    .single();
  
  return { data: updatedTask, error };
}

export async function deleteTaskFromDB(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Backlog item management functions
export async function createBacklogItemInDB(data: BacklogItemFormData) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  // For now, we'll store backlog items as tasks without a sprint or column
  const { data: newItem, error } = await supabase
    .from('tasks')
    .insert({
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      story_points: data.storyPoints,
      project_id: data.projectId || '',
      sprint_id: null, // No sprint assigned yet
      column_id: null, // No column assigned yet
      status: 'backlog'
    })
    .select()
    .single();
  
  return { data: newItem, error };
}

export async function getBacklogItemsFromDB(projectId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'backlog');
  
  return { data, error };
}

export async function updateBacklogItemInDB(id: string, data: BacklogItemFormData) {
  const { data: updatedItem, error } = await supabase
    .from('tasks')
    .update({
      title: data.title,
      description: data.description,
      priority: data.priority,
      story_points: data.storyPoints
    })
    .eq('id', id)
    .eq('status', 'backlog')
    .select()
    .single();
  
  return { data: updatedItem, error };
}

export async function moveBacklogItemToSprintInDB(itemId: string, sprintId: string) {
  // Find the TO DO column for this sprint
  const { data: columns } = await supabase
    .from('board_columns')
    .select('*')
    .eq('sprint_id', sprintId)
    .eq('title', 'TO DO')
    .single();
  
  if (!columns) {
    return { error: new Error('Could not find TO DO column for sprint') };
  }

  const columnId = columns.id;

  // Update the task to be part of the sprint and column
  const { data: updatedItem, error } = await supabase
    .from('tasks')
    .update({
      sprint_id: sprintId,
      column_id: columnId,
      status: 'to_do'
    })
    .eq('id', itemId)
    .select()
    .single();
  
  return { data: updatedItem, error };
}

export async function deleteBacklogItemFromDB(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('status', 'backlog');
  
  return { error };
}
