
import { supabase } from './client';

export async function getColumnsForSprint(sprintId: string) {
  return await supabase
    .from('board_columns')
    .select('*')
    .eq('sprint_id', sprintId)
    .order('order_index');
}

export async function createColumnInDB(sprintId: string, title: string) {
  // Get the highest order_index
  const { data: columns } = await supabase
    .from('board_columns')
    .select('order_index')
    .eq('sprint_id', sprintId)
    .order('order_index', { ascending: false })
    .limit(1);
  
  const nextOrderIndex = columns && columns.length > 0 ? columns[0].order_index + 1 : 0;
  
  return await supabase
    .from('board_columns')
    .insert({
      title,
      sprint_id: sprintId,
      order_index: nextOrderIndex,
    })
    .select()
    .single();
}

export async function deleteColumnFromDB(columnId: string) {
  return await supabase
    .from('board_columns')
    .delete()
    .eq('id', columnId);
}
