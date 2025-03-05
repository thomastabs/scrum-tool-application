
import { BacklogItemFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useBacklog() {
  const queryClient = useQueryClient();

  const createBacklogItemMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string, data: BacklogItemFormData }) => {
      const { error } = await supabase
        .from('backlog_items')
        .insert({
          project_id: projectId,
          title: data.title,
          description: data.description,
          priority: data.priority,
          story_points: data.storyPoints
        });
      
      if (error) throw error;
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
          story_points: data.storyPoints,
          updated_at: new Date().toISOString()
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
    if (!projectId) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createBacklogItemMutation.mutateAsync({
        projectId,
        data
      });
      
      toast({
        title: "Backlog item created",
        description: `${data.title} has been added to the backlog.`,
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
        description: `${data.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteBacklogItem = async (id: string, backlogItems: any[]) => {
    const itemToDelete = backlogItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    try {
      await deleteBacklogItemMutation.mutateAsync(id);
      
      toast({
        title: "Backlog item deleted",
        description: `${itemToDelete.title} has been deleted from the backlog.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const moveBacklogItemToSprint = async (
    backlogItemId: string, 
    sprintId: string, 
    backlogItems: any[], 
    columns: any[],
    createTaskFn: (sprintId: string, columnId: string, data: any) => Promise<void>
  ) => {
    // Find the backlog item
    const backlogItem = backlogItems.find(item => item.id === backlogItemId);
    if (!backlogItem) return;
    
    // Find the TO DO column
    const todoColumn = columns.find(col => col.title === "TO DO");
    if (!todoColumn) {
      toast({
        title: "Error",
        description: "TO DO column not found. Please create a sprint first.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create a task from the backlog item
      await createTaskFn(
        sprintId,
        todoColumn.id,
        {
          title: backlogItem.title,
          description: backlogItem.description,
          priority: backlogItem.priority,
          assignee: "",
          storyPoints: backlogItem.storyPoints
        }
      );
      
      // Delete the backlog item
      await deleteBacklogItemMutation.mutateAsync(backlogItemId);
      
      toast({
        title: "Item moved to sprint",
        description: `${backlogItem.title} has been moved to the selected sprint.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    createBacklogItem,
    updateBacklogItem,
    deleteBacklogItem,
    moveBacklogItemToSprint
  };
}
