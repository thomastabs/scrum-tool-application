
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kqlwrqmqlelfetdkryid.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbHdycW1xbGVsZmV0ZGtyeWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDA5NTUsImV4cCI6MjA1NjA3Njk1NX0.3HZBj-o_hiLa3hBBqy-LgEEhIAgctvhEIsLKdMvd92I';

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

// Project database functions
export async function createProjectInDB(projectData: ProjectFormData, userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      title: projectData.title,
      description: projectData.description,
      end_goal: projectData.endGoal,
      owner_id: userId,
      user_id: userId  // Adding user_id for RLS policies
    })
    .select()
    .single();
    
  return { data, error };
}

export async function getProjectsFromDB() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
    
  return { data, error };
}

export async function updateProjectInDB(id: string, projectData: ProjectFormData) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      title: projectData.title,
      description: projectData.description,
      end_goal: projectData.endGoal,
      updated_at: new Date()
    })
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
}

export async function deleteProjectFromDB(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
    
  return { error };
}

// Sprint database functions
export async function createSprintInDB(sprintData: SprintFormData, projectId: string) {
  // Get the current user
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  
  if (!userId) {
    return { data: null, error: "User not authenticated" };
  }
  
  const { data, error } = await supabase
    .from('sprints')
    .insert({
      title: sprintData.title,
      description: sprintData.description,
      project_id: projectId,
      start_date: sprintData.startDate,
      end_date: sprintData.endDate,
      is_completed: false,
      user_id: userId  // Adding user_id for RLS policies
    })
    .select()
    .single();
    
  return { data, error };
}

export async function getSprintsFromDB(projectId?: string) {
  let query = supabase
    .from('sprints')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  
  const { data, error } = await query;
  return { data, error };
}

export async function updateSprintInDB(id: string, sprintData: SprintFormData) {
  const { data, error } = await supabase
    .from('sprints')
    .update({
      title: sprintData.title,
      description: sprintData.description,
      start_date: sprintData.startDate,
      end_date: sprintData.endDate,
      updated_at: new Date()
    })
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
}

export async function completeSprintInDB(id: string) {
  const { data, error } = await supabase
    .from('sprints')
    .update({
      is_completed: true,
      updated_at: new Date()
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

// Board columns functions
export async function createColumnInDB(title: string, sprintId: string) {
  // Get the current user
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  
  if (!userId) {
    return { data: null, error: "User not authenticated" };
  }
  
  // Get the max order index for existing columns
  const { data: existingColumns, error: fetchError } = await supabase
    .from('board_columns')
    .select('order_index')
    .eq('sprint_id', sprintId)
    .order('order_index', { ascending: false })
    .limit(1);
    
  let orderIndex = 0;
  if (!fetchError && existingColumns && existingColumns.length > 0) {
    orderIndex = (existingColumns[0].order_index || 0) + 1;
  }
  
  const { data, error } = await supabase
    .from('board_columns')
    .insert({
      title,
      sprint_id: sprintId,
      user_id: userId,
      order_index: orderIndex
    })
    .select()
    .single();
    
  return { data, error };
}

export async function getColumnsFromDB(sprintId?: string) {
  let query = supabase
    .from('board_columns')
    .select('*')
    .order('order_index', { ascending: true });
    
  if (sprintId) {
    query = query.eq('sprint_id', sprintId);
  }
  
  const { data, error } = await query;
  return { data, error };
}

export async function deleteColumnFromDB(id: string) {
  const { error } = await supabase
    .from('board_columns')
    .delete()
    .eq('id', id);
    
  return { error };
}

// Task functions
export async function createTaskInDB(taskData: any, columnId: string, sprintId: string) {
  // Get the current user
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  
  if (!userId) {
    return { data: null, error: "User not authenticated" };
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee || '',
      story_points: taskData.storyPoints || 1,
      column_id: columnId,
      sprint_id: sprintId,
      user_id: userId,
      status: 'todo'
    })
    .select()
    .single();
    
  return { data, error };
}

export async function getTasksFromDB(columnId?: string, sprintId?: string) {
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (columnId) {
    query = query.eq('column_id', columnId);
  }
  
  if (sprintId) {
    query = query.eq('sprint_id', sprintId);
  }
  
  const { data, error } = await query;
  return { data, error };
}

export async function updateTaskInDB(id: string, taskData: any) {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      assignee: taskData.assignee,
      story_points: taskData.storyPoints,
      updated_at: new Date()
    })
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
}

export async function updateTaskColumnInDB(id: string, columnId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      column_id: columnId,
      updated_at: new Date()
    })
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
}

export async function deleteTaskFromDB(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
    
  return { error };
}

export async function sendCollaboratorInvitation(projectId: string, projectTitle: string, collaboratorData: CollaboratorFormData) {
  try {
    // Get current user's email for the invitation
    const { data: userData } = await supabase.auth.getUser();
    const inviterEmail = userData.user?.email || 'A team member';
    
    // Store invitation in the collaborators table
    const { data: collaborator, error: dbError } = await supabase
      .from('collaborators')
      .insert({
        project_id: projectId,
        email: collaboratorData.email,
        role: collaboratorData.role,
        user_id: userData.user?.id // Adding user_id for RLS policies
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Failed to store invitation:', dbError);
      return { success: false, error: dbError.message };
    }
    
    // Send the actual email via Edge Function
    const { data, error } = await supabase.functions.invoke('send-invitation-email', {
      body: {
        to: collaboratorData.email,
        projectTitle,
        inviterEmail,
        projectId,
        role: collaboratorData.role,
        collaboratorId: collaborator.id
      }
    });
    
    if (error) {
      console.error('Failed to send invitation email:', error);
      // Delete the collaborator record if the email fails
      await supabase
        .from('collaborators')
        .delete()
        .eq('id', collaborator.id);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending invitation:', error);
    return { success: false, error: 'Failed to send invitation' };
  }
}

// User profile functions
export async function getUserProfile() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: "User not authenticated" };
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();
    
  return { data, error };
}

export async function updateUserProfile(profileData: any) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { data: null, error: "User not authenticated" };
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      username: profileData.username,
      avatar_url: profileData.avatarUrl,
      updated_at: new Date()
    })
    .eq('id', userData.user.id)
    .select()
    .single();
    
  return { data, error };
}
