
import { supabase } from './client';

export async function getColumnsForSprint(sprintId: string) {
  const { data, error } = await supabase
    .from('kanban_columns')
    .select('*')
    .eq('sprint_id', sprintId)
    .order('position', { ascending: true });
  
  return { data, error };
}

export async function createColumnInDB(sprintId: string, title: string) {
  // Get the highest position value
  const { data: columns } = await supabase
    .from('kanban_columns')
    .select('position')
    .eq('sprint_id', sprintId)
    .order('position', { ascending: false })
    .limit(1);
  
  const position = columns && columns.length > 0 ? columns[0].position + 1 : 0;
  
  const { data: newColumn, error } = await supabase
    .from('kanban_columns')
    .insert({
      sprint_id: sprintId,
      title,
      position,
      is_default: false
    })
    .select()
    .single();
  
  return { data: newColumn, error };
}

export async function deleteColumnFromDB(columnId: string) {
  // Check if it's a default column
  const { data: column } = await supabase
    .from('kanban_columns')
    .select('is_default')
    .eq('id', columnId)
    .single();
  
  if (column && column.is_default) {
    return { error: new Error('Cannot delete default columns') };
  }
  
  const { error } = await supabase
    .from('kanban_columns')
    .delete()
    .eq('id', columnId);
  
  return { error };
}
