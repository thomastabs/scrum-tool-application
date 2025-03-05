
import { SprintFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSprints() {
  const queryClient = useQueryClient();

  const createSprintMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string, data: SprintFormData }) => {
      const { error } = await supabase
        .from('sprints')
        .insert({
          project_id: projectId,
          title: data.title,
          description: data.description,
          start_date: data.startDate.toISOString(),
          end_date: data.endDate.toISOString(),
          is_completed: false
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating sprint",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateSprintMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: SprintFormData }) => {
      const { error } = await supabase
        .from('sprints')
        .update({
          title: data.title,
          description: data.description,
          start_date: data.startDate.toISOString(),
          end_date: data.endDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating sprint",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const completeSprintMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sprints')
        .update({
          is_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error completing sprint",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const createSprint = async (projectId: string, data: SprintFormData) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createSprintMutation.mutateAsync({ 
        projectId, 
        data 
      });
      
      toast({
        title: "Sprint created",
        description: `${data.title} has been created successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateSprint = async (id: string, data: SprintFormData) => {
    try {
      await updateSprintMutation.mutateAsync({ id, data });
      
      toast({
        title: "Sprint updated",
        description: `${data.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const completeSprint = async (id: string, sprints: any[]) => {
    try {
      await completeSprintMutation.mutateAsync(id);
      
      const sprint = sprints.find(s => s.id === id);
      if (sprint) {
        toast({
          title: "Sprint completed",
          description: `${sprint.title} has been marked as completed.`,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    createSprint,
    updateSprint,
    completeSprint
  };
}
