
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { TaskFormData } from "@/types";

export function useTasks() {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async ({ sprintId, columnId, data }: { sprintId: string, columnId: string, data: TaskFormData }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("You must be signed in to create a task");

      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          sprint_id: sprintId,
          column_id: columnId,
          title: data.title,
          description: data.description,
          priority: data.priority,
          assignee: data.assignee,
          story_points: data.storyPoints,
          user_id: userData.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return newTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: TaskFormData }) => {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: data.title,
          description: data.description,
          priority: data.priority,
          assignee: data.assignee,
          story_points: data.storyPoints
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const moveTaskMutation = useMutation({
    mutationFn: async ({ taskId, destinationColumnId }: { taskId: string, destinationColumnId: string }) => {
      const { error } = await supabase
        .from('tasks')
        .update({
          column_id: destinationColumnId
        })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error moving task",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const createTask = async (sprintId: string, columnId: string, data: TaskFormData) => {
    try {
      await createTaskMutation.mutateAsync({ sprintId, columnId, data });
      
      toast({
        title: "Task created",
        description: `"${data.title}" has been created successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateTask = async (id: string, data: TaskFormData) => {
    try {
      await updateTaskMutation.mutateAsync({ id, data });
      
      toast({
        title: "Task updated",
        description: `"${data.title}" has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteTaskMutation.mutateAsync(id);
      
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const moveTask = async (taskId: string, sourceColumnId: string, destinationColumnId: string) => {
    try {
      await moveTaskMutation.mutateAsync({ taskId, destinationColumnId });
      
      toast({
        title: "Task moved",
        description: "Task has been moved successfully.",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    moveTask
  };
}
