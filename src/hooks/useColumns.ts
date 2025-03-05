
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useColumns() {
  const queryClient = useQueryClient();

  const createColumnMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from('columns')
        .insert({
          title
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating column",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteColumnMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting column",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const createColumn = async (sprintId: string, title: string, columns: any[]) => {
    const columnExists = columns.some(col => col.title === title);
    
    if (columnExists) {
      toast({
        title: "Column already exists",
        description: `A column named "${title}" already exists.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createColumnMutation.mutateAsync(title);
      
      toast({
        title: "Column created",
        description: `${title} column has been created successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteColumn = async (id: string, columns: any[]) => {
    const columnToDelete = columns.find(column => column.id === id);
    if (!columnToDelete) return;
    
    if (columnToDelete.tasks.length > 0) {
      toast({
        title: "Cannot delete column",
        description: "This column still has tasks. Move or delete them first.",
        variant: "destructive"
      });
      return;
    }
    
    if (["TO DO", "IN PROGRESS", "DONE"].includes(columnToDelete.title)) {
      toast({
        title: "Cannot delete default column",
        description: "The default columns (TO DO, IN PROGRESS, DONE) cannot be deleted.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await deleteColumnMutation.mutateAsync(id);
      
      toast({
        title: "Column deleted",
        description: `${columnToDelete.title} column has been deleted successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    createColumn,
    deleteColumn
  };
}
