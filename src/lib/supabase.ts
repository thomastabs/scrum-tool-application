
import { createClient } from '@supabase/supabase-js';
import { ProjectFormData, SprintFormData } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btutiksghrrxrxqxwlnk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dXRpa3NnaHJyeHJ4cXh3bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDk2ODUsImV4cCI6MjA1NjMyNTY4NX0.SSAGtVl0jMLM9v6isoC4oZOZ-Q92nLNZO2RMOUZeyaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Custom authentication functions
export async function signUp(email: string, password: string, username: string) {
  try {
    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`);
    
    if (existingUsers && existingUsers.length > 0) {
      return { 
        data: null, 
        error: { 
          message: "A user with this email or username already exists",
          status: 409
        } 
      };
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking for existing user:", checkError);
      return { data: null, error: checkError };
    }
    
    // Create authentication account first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });
    
    if (authError) {
      console.error("Error creating auth user:", authError);
      return { data: null, error: authError };
    }
    
    if (!authData.user) {
      return { 
        data: null, 
        error: { 
          message: "Failed to create user account",
          status: 500
        } 
      };
    }
    
    // Hash password using our custom function
    const { data: hashedPassword, error: hashError } = await supabase.rpc(
      'hash_password',
      { password }
    );
    
    if (hashError) {
      console.error("Error hashing password:", hashError);
      return { data: null, error: hashError };
    }
    
    // Insert the user into our users table
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id, // Use the auth user's ID
        username,
        email,
        password: hashedPassword
      })
      .select('id, username, email')
      .single();
    
    if (insertError) {
      console.error("Error creating user in users table:", insertError);
      return { data: null, error: insertError };
    }
    
    return { data: authData, error: null };
  } catch (err: any) {
    console.error("Unexpected error in signUp function:", err);
    const errorMessage = err?.message || "An unexpected error occurred during sign up.";
    return { 
      data: null, 
      error: { 
        message: errorMessage,
        status: err?.status || 500
      } 
    };
  }
}

export async function signIn(email: string, password: string) {
  try {
    // Sign in using Supabase Auth to get a session
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Error signing in with Supabase:", error);
      return { data: null, error };
    }
    
    // Get user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      console.error("Error fetching user data:", userError);
      // Still return auth data even if we can't get our custom user data
      return { data, error: null };
    }
    
    // Add custom user data to the session
    const enhancedData = {
      ...data,
      user: {
        ...data.user,
        user_metadata: {
          ...data.user?.user_metadata,
          username: userData.username,
          user_id: userData.id
        }
      }
    };
    
    return { data: enhancedData, error: null };
  } catch (err: any) {
    console.error("Unexpected error in signIn function:", err);
    const errorMessage = err?.message || "An unexpected error occurred during sign in.";
    return { 
      data: null, 
      error: { 
        message: errorMessage, 
        status: err?.status || 500 
      } 
    };
  }
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
      owner_id: userData.user.id, // Updated from user_id to owner_id
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
    .eq('owner_id', userData.user.id) // Updated from user_id to owner_id
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
    .eq('owner_id', userData.user.id) // Updated from user_id to owner_id
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
