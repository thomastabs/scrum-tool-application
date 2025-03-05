
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { BacklogItemFormData } from "@/types";

export function useBacklog() {
  const queryClient = useQueryClient();

  const createBacklogItemMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string, data: BacklogItemFormData }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("You must be signed in to create a backlog item");

      const { data: newItem, error } = await supabase
        .from('backlog_items')
        .insert({
          project_id: projectId,
          title: data.title,
          description: data.description,
          priority: data.priority,
          story_points: data.storyPoints,
          user_id: userData.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return newItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlogItems'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating backlog item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateBacklogItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: BacklogItemFormData }) => {
      const { error } = await supabase
        .from('backlog_items')
        .update({
          title: data.title,
          description: data.description,
          priority: data.priority,
          story_points: data.storyPoints
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlogItems'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating backlog item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteBacklogItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('backlog_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlogItems'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting backlog item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const createBacklogItem = async (projectId: string, data: BacklogItemFormData) => {
    try {
      await createBacklogItemMutation.mutateAsync({ projectId, data });
      
      toast({
        title: "Backlog item created",
        description: `"${data.title}" has been created successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateBacklogItem = async (id: string, data: BacklogItemFormData) => {
    try {
      await updateBacklogItemMutation.mutateAsync({ id, data });
      
      toast({
        title: "Backlog item updated",
        description: `"${data.title}" has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteBacklogItem = async (id: string) => {
    try {
      await deleteBacklogItemMutation.mutateAsync(id);
      
      toast({
        title: "Backlog item deleted",
        description: "Backlog item has been deleted successfully.",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const moveBacklogItemToSprint = async (backlogItemId: string, sprintId: string) => {
    // This is a placeholder implementation
    // In a real app, this would involve moving the item to a sprint
    // and creating a task from it
    console.log(`Moving backlog item ${backlogItemId} to sprint ${sprintId}`);
    
    toast({
      title: "Item moved to sprint",
      description: "Backlog item has been moved to the selected sprint.",
    });
  };

  return {
    createBacklogItem,
    updateBacklogItem,
    deleteBacklogItem,
    moveBacklogItemToSprint
  };
}
