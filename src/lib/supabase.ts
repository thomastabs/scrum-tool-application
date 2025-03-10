
import { createClient } from '@supabase/supabase-js';

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

// Helper function to add a custom column
export const addCustomColumn = async (sprintId: string, userId: string, title: string, orderIndex: number) => {
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
    console.error('Error adding custom column:', error);
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
