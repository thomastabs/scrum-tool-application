
import { createClient } from '@supabase/supabase-js';
import { Collaborator } from '@/types';

const supabaseUrl = 'https://wslflobdapmebkjnaqld.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbGZsb2JkYXBtZWJram5hcWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NDc2ODQsImV4cCI6MjA1NzAyMzY4NH0.lNk_nX9S7KMjSYnR1JpFns7biqXvq0Ln2Z6pAYGi9aQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to fetch columns for a sprint
export const fetchSprintColumns = async (sprintId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('board_columns')
      .select('*')
      .eq('sprint_id', sprintId)
      .eq('user_id', userId)
      .order('order_index', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sprint columns:', error);
    return [];
  }
};

// Helper function to create a default column
export const createDefaultColumn = async (sprintId: string, userId: string, title: string, orderIndex: number) => {
  try {
    const { data, error } = await supabase
      .from('board_columns')
      .insert({
        sprint_id: sprintId,
        user_id: userId,
        title: title,
        order_index: orderIndex
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating default column:', error);
    return null;
  }
};

// Helper function to delete a column
export const deleteColumn = async (columnId: string) => {
  try {
    const { error } = await supabase
      .from('board_columns')
      .delete()
      .eq('id', columnId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting column:', error);
    return false;
  }
};

// Helper function to find a user by email or username
export const findUserByEmailOrUsername = async (emailOrUsername: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email')
      .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
      .single();
      
    if (error) {
      console.error('Error finding user:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
};

// Helper function to add a collaborator to a project
export const addCollaborator = async (projectId: string, userId: string, role: 'viewer' | 'member' | 'admin') => {
  try {
    const { data, error } = await supabase
      .from('collaborators')
      .insert({
        project_id: projectId,
        user_id: userId,
        role: role
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding collaborator:', error);
    throw error;
  }
};

// Helper function to fetch collaborators for a project
export const fetchProjectCollaborators = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('collaborators')
      .select(`
        id,
        role,
        created_at,
        user_id,
        users:user_id (id, username, email)
      `)
      .eq('project_id', projectId);
      
    if (error) throw error;
    
    // Transform the data to match our Collaborator type
    const collaborators: Collaborator[] = (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      username: item.users?.username || '',
      email: item.users?.email || '',
      role: item.role,
      createdAt: item.created_at
    }));
    
    return collaborators;
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return [];
  }
};

// Helper function to remove a collaborator from a project
export const removeCollaborator = async (collaboratorId: string) => {
  try {
    const { error } = await supabase
      .from('collaborators')
      .delete()
      .eq('id', collaboratorId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing collaborator:', error);
    return false;
  }
};

// Helper function to update a collaborator's role
export const updateCollaboratorRole = async (collaboratorId: string, role: 'viewer' | 'member' | 'admin') => {
  try {
    const { error } = await supabase
      .from('collaborators')
      .update({ role })
      .eq('id', collaboratorId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating collaborator role:', error);
    return false;
  }
};

// Helper function to fetch projects where user is a collaborator
export const fetchCollaborativeProjects = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('collaborators')
      .select(`
        role,
        projects:project_id (
          id, 
          title, 
          description, 
          end_goal, 
          created_at, 
          updated_at,
          owner:owner_id (username, email)
        )
      `)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Transform the data to include role information
    return (data || []).map(item => ({
      ...item.projects,
      role: item.role,
      ownerName: item.projects?.owner?.username || '',
      isCollaboration: true
    }));
  } catch (error) {
    console.error('Error fetching collaborative projects:', error);
    return [];
  }
};
