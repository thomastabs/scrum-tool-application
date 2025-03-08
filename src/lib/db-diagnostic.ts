
import { supabase } from './supabase';

export async function checkDatabaseConnection() {
  try {
    // Test if we can connect to Supabase at all
    const { data: connectionTest, error: connectionError } = await supabase.from('users').select('count(*)', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error("Database connection error:", connectionError);
      
      // Check specifically for table existence issue
      if (connectionError.code === '42P01' || connectionError.message.includes("relation") || connectionError.message.includes("does not exist")) {
        console.warn("The users table doesn't exist in the database");
        
        // Try to explicitly check if other tables exist
        const { data: tablesData, error: tablesError } = await supabase.rpc('get_tables');
        
        if (tablesError) {
          console.error("Error checking tables:", tablesError);
          return { status: "error", message: "Unable to check database tables", detail: tablesError };
        }
        
        return { 
          status: "error", 
          message: "Users table not found", 
          detail: "Available tables: " + JSON.stringify(tablesData) 
        };
      }
      
      return { status: "error", message: "Database connection failed", detail: connectionError };
    }
    
    return { status: "success", message: "Database connection successful", detail: connectionTest };
  } catch (err) {
    console.error("Unexpected error during database check:", err);
    return { status: "error", message: "Unexpected error checking database", detail: err };
  }
}
