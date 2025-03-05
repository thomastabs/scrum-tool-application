
import { useState } from "react";
import { Collaborator, CollaboratorFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export function useCollaborators() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const queryClient = useQueryClient();

  const inviteCollaborator = async (
    projectId: string, 
    projectTitle: string, 
    data: CollaboratorFormData
  ) => {
    if (!projectId) {
      return { 
        success: false, 
        error: "No project selected." 
      };
    }
    
    try {
      // In a real implementation, this would send an email invitation
      // For now, just create the collaborator record
      const { data: newCollaborator, error } = await supabase
        .from('collaborators')
        .insert({
          project_id: projectId,
          email: data.email,
          role: data.role,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        return { 
          success: false, 
          error: error.message 
        };
      }
      
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error inviting collaborator:", error);
      return { 
        success: false, 
        error: error.message || "An unexpected error occurred. Please try again." 
      };
    }
  };

  const removeCollaborator = async (id: string) => {
    try {
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast({
          title: "Error removing collaborator",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      
      toast({
        title: "Collaborator removed",
        description: "The collaborator has been removed from the project.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing collaborator",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getProjectCollaborators = (projectId: string) => {
    return collaborators.filter(c => c.projectId === projectId);
  };

  return {
    collaborators,
    setCollaborators,
    inviteCollaborator,
    removeCollaborator,
    getProjectCollaborators
  };
}
