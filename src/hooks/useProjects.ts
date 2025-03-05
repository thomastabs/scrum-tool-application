
import { useState } from "react";
import { Project, ProjectFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useProjects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("You must be signed in to create a project");
      
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          owner_id: user.user.id,
          title: data.title,
          description: data.description,
          end_goal: data.endGoal
        })
        .select()
        .single();
      
      if (error) throw error;
      return newProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: ProjectFormData }) => {
      const { error } = await supabase
        .from('projects')
        .update({
          title: data.title,
          description: data.description,
          end_goal: data.endGoal,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['backlogItems'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const createProject = async (data: ProjectFormData) => {
    try {
      const newProject = await createProjectMutation.mutateAsync(data);
      toast({
        title: "Project created",
        description: `${data.title} has been created successfully.`,
      });
      setSelectedProject(newProject);
    } catch (error) {
      console.error(error);
    }
  };

  const updateProject = async (id: string, data: ProjectFormData) => {
    try {
      await updateProjectMutation.mutateAsync({ id, data });
      
      if (selectedProject && selectedProject.id === id) {
        const updatedProject = {
          ...selectedProject,
          ...data,
          updatedAt: new Date()
        };
        setSelectedProject(updatedProject);
      }
      
      toast({
        title: "Project updated",
        description: `${data.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProject = async (id: string, projects: Project[]) => {
    try {
      const projectToDelete = projects.find(project => project.id === id);
      if (!projectToDelete) return;
      
      await deleteProjectMutation.mutateAsync(id);
      
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject(null);
      }
      
      toast({
        title: "Project deleted",
        description: `${projectToDelete.title} has been deleted successfully.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const selectProject = (id: string, projects: Project[]) => {
    if (!id) {
      setSelectedProject(null);
      return;
    }
    
    const project = projects.find(p => p.id === id);
    if (project) {
      setSelectedProject(project);
    }
  };

  return {
    selectedProject,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    setSelectedProject
  };
}
