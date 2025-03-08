
import { createClient } from '@supabase/supabase-js';
import { ProjectFormData, SprintFormData } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btutiksghrrxrxqxwlnk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dXRpa3NnaHJyeHJ4cXh3bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDk2ODUsImV4cCI6MjA1NjMyNTY4NX0.SSAGtVl0jMLM9v6isoC4oZOZ-Q92nLNZO2RMOUZeyaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Session management
let currentUser: { id: string; username: string; email: string } | null = null;

// Custom authentication functions
export async function signUp(email: string, password: string, username: string) {
  try {
    console.log("Starting signup with email:", email, "and username:", username);
    
    // First, try to verify if the users table exists by performing a count query
    const { count, error: tableCheckError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (tableCheckError) {
      console.error("Error checking users table:", tableCheckError);
      // If we get an error that the relation doesn't exist, we should create it
      if (tableCheckError.code === '42P01' || tableCheckError.message.includes("relation") || tableCheckError.message.includes("does not exist")) {
        console.warn("Users table doesn't exist. The table should be created via migration.");
        return { 
          data: null, 
          error: { 
            message: "Database setup incomplete. Please contact administrator.", 
            status: 500 
          } 
        };
      }
    }
    
    // Check if user already exists with this email or username
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .limit(1);
    
    if (checkError) {
      console.error("Error checking for existing user:", checkError);
      return { data: null, error: checkError };
    }
    
    if (existingUsers && existingUsers.length > 0) {
      return { 
        data: null, 
        error: { 
          message: "A user with this email or username already exists",
          status: 409
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
    console.log("Attempting to insert new user into database");
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
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
    
    // Set the current user in the session
    currentUser = newUser;
    
    // Save user data to localStorage
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return { 
      data: { 
        user: newUser
      }, 
      error: null 
    };
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

export async function signIn(emailOrUsername: string, password: string) {
  try {
    // Verify password and get user data
    const { data: userData, error: verifyError } = await supabase.rpc(
      'verify_password',
      { login_credential: emailOrUsername, input_password: password }
    );
    
    if (verifyError) {
      console.error("Error verifying password:", verifyError);
      return { 
        data: null, 
        error: { 
          message: "Invalid email/username or password",
          status: 401
        } 
      };
    }
    
    if (!userData || userData.length === 0) {
      return { 
        data: null, 
        error: { 
          message: "Invalid email/username or password",
          status: 401
        } 
      };
    }
    
    // Set the current user in the session
    currentUser = userData[0];
    
    // Save user data to localStorage
    localStorage.setItem('currentUser', JSON.stringify(userData[0]));
    
    return { 
      data: { 
        user: userData[0]
      }, 
      error: null 
    };
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
  try {
    // Clear current user
    currentUser = null;
    
    // Remove user data from localStorage
    localStorage.removeItem('currentUser');
    
    return { error: null };
  } catch (err: any) {
    console.error("Error signing out:", err);
    return { 
      error: { 
        message: "Error signing out", 
        status: 500 
      } 
    };
  }
}

export async function getSession() {
  try {
    // Check if we have a current user
    if (currentUser) {
      return { session: { user: currentUser }, error: null };
    }
    
    // Check if we have a user in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      currentUser = user;
      return { session: { user }, error: null };
    }
    
    // No session found
    return { session: null, error: null };
  } catch (err: any) {
    console.error("Error getting session:", err);
    return { 
      session: null, 
      error: { 
        message: "Error retrieving session", 
        status: 500 
      } 
    };
  }
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
    .eq('owner_id', userData.user.id)
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

  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', userData.user.id);
  
  if (projects && projects.length > 0) {
    const projectIds = projects.map(project => project.id);
    
    await supabase
      .from('sprints')
      .delete()
      .in('project_id', projectIds);
    
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
      user_id: userData.user.id,
      title: data.title,
      description: data.description,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      duration: Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24))
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
      duration: Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24))
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
