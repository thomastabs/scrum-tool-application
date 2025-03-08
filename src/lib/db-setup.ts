
import { supabase } from './supabase';

export async function ensureUsersTableExists() {
  try {
    // Check if the users table exists
    const { error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    // If we get a "relation does not exist" error, try to create the table
    if (checkError && (checkError.code === '42P01' || checkError.message.includes("relation") || checkError.message.includes("does not exist"))) {
      console.log("Users table doesn't exist, attempting to create it via RPC...");
      
      // Call a Supabase function to create the table (this would need to be set up in Supabase)
      const { data: createResult, error: createError } = await supabase.rpc('create_users_table');
      
      if (createError) {
        console.error("Error creating users table:", createError);
        return { success: false, error: createError };
      }
      
      console.log("Users table created successfully:", createResult);
      return { success: true, data: createResult };
    } else if (checkError) {
      // Some other error occurred
      console.error("Error checking users table:", checkError);
      return { success: false, error: checkError };
    }
    
    // Table exists
    return { success: true, message: "Users table already exists" };
  } catch (err) {
    console.error("Unexpected error in ensureUsersTableExists:", err);
    return { success: false, error: err };
  }
}
