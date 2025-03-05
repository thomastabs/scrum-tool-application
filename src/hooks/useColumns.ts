
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase"; 
import { toast } from "@/components/ui/use-toast";

export function useColumns() {
  const queryClient = useQueryClient();

  const createColumnMutation = useMutation({
    mutationFn: async ({ sprintId, title }: { sprintId: string, title: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("You must be signed in to create a column");

      const { data, error } = await supabase
        .from('board_columns')
        .insert({
          sprint_id: sprintId,
          title,
          user_id: userData.user.id
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
        .from('board_columns')
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

  const createColumn = async (sprintId: string, title: string) => {
    try {
      await createColumnMutation.mutateAsync({ sprintId, title });
      
      toast({
        title: "Column created",
        description: `${title} column has been created successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      await deleteColumnMutation.mutateAsync(id);
      
      toast({
        title: "Column deleted",
        description: "Column has been deleted successfully.",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    createColumn,
    deleteColumn,
  };
}
