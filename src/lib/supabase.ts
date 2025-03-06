
import { createClient } from '@supabase/supabase-js';
import { ProjectFormData, SprintFormData } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btutiksghrrxrxqxwlnk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dXRpa3NnaHJyeHJ4cXh3bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDk2ODUsImV4cCI6MjA1NjMyNTY4NX0.SSAGtVl0jMLM9v6isoC4oZOZ-Q92nLNZO2RMOUZeyaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUp(email: string, password: string) {
  console.log("Signing up with email:", email);
  
  // Determine the current origin for redirect URL
  const origin = window.location.origin;
  const redirectTo = `${origin}/sign-in`;
  console.log("Redirect URL set to:", redirectTo);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: { 
        email_confirmed: false 
      }
    }
  });
  
  if (error) {
    console.error("Sign up error:", error.message);
  } else if (data?.user) {
    console.log("Sign up initiated for:", email);
    
    if (!data.session) {
      console.log("Email verification required. Confirmation email sent to:", email);
    } else {
      console.log("Sign up successful with immediate session:", data.user?.email);
    }
  }
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  console.log("Attempting to sign in with:", email);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Sign in error:", error.message);
      
      // Check if the error is related to email confirmation
      if (error.message.includes("Email not confirmed")) {
        console.log("User email not confirmed. Resending confirmation email...");
        await resendConfirmationEmail(email);
      }
    } else if (data?.session) {
      console.log("Sign in successful for:", data.user?.email);
    } else {
      console.log("No session returned after sign in");
    }
    
    return { data, error };
  } catch (err) {
    console.error("Unexpected error in signIn function:", err);
    throw err;
  }
}

export async function resendConfirmationEmail(email: string) {
  console.log("Resending confirmation email to:", email);
  
  const origin = window.location.origin;
  const redirectTo = `${origin}/sign-in`;
  
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: redirectTo,
    }
  });
  
  if (error) {
    console.error("Error resending confirmation email:", error.message);
  } else {
    console.log("Confirmation email resent successfully");
  }
  
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
