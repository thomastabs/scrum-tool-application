
import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import { ProjectContextType } from "@/types";
import { projectReducer, initialState } from "./projectReducer";
import { 
  createProject, 
  updateProject, 
  createSprint, 
  updateSprint, 
  createTask, 
  updateTask, 
  createColumn, 
  createBacklogItem, 
  updateBacklogItem 
} from "./projectActions";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Project } from "@/types";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const [loading, setLoading] = useState(false);

  // Function to directly set projects from database
  const setProjects = (projects: Project[]) => {
    // Clear local storage to prevent caching issues
    localStorage.removeItem("projectState");
    
    dispatch({ type: "SET_PROJECTS", payload: projects });
  };

  // useEffect(() => {
  //   localStorage.setItem("projectState", JSON.stringify(state));
  // }, [state]);

  const contextValue: ProjectContextType = {
    projects: state.projects,
    sprints: state.sprints,
    columns: state.columns,
    backlogItems: state.backlogItems,
    selectedProject: state.selectedProject,
    loading,
    setProjects, // Add the new function
    
    selectProject: (id: string) => {
      dispatch({ type: "SELECT_PROJECT", payload: id });
    },
    
    createProject: async (projectData) => {
      setLoading(true);
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (!user.user) {
          toast({
            title: "Error creating project",
            description: "You must be logged in to create a project",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('projects')
          .insert({
            title: projectData.title,
            description: projectData.description,
            end_goal: projectData.endGoal,
            user_id: user.user.id
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating project:", error);
          toast({
            title: "Error creating project",
            description: error.message,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Convert to the application's Project format
        const newProject: Project = {
          id: data.id,
          title: data.title,
          description: data.description || "",
          endGoal: data.end_goal || "",
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.created_at)
        };

        dispatch({ type: "ADD_PROJECT", payload: newProject });
        toast({
          title: "Project created",
          description: `${projectData.title} has been created successfully.`
        });
      } catch (err) {
        console.error("Error in createProject:", err);
        toast({
          title: "Error creating project",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    },
    
    updateProject: async (id, projectData) => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('projects')
          .update({
            title: projectData.title,
            description: projectData.description,
            end_goal: projectData.endGoal
          })
          .eq('id', id);

        if (error) {
          console.error("Error updating project:", error);
          toast({
            title: "Error updating project",
            description: error.message,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Update local state
        const updatedProject = {
          id,
          title: projectData.title,
          description: projectData.description,
          endGoal: projectData.endGoal,
          updatedAt: new Date(),
          createdAt: state.projects.find(p => p.id === id)?.createdAt || new Date()
        };
        
        dispatch({ type: "UPDATE_PROJECT", payload: updatedProject });
        toast({
          title: "Project updated",
          description: `${projectData.title} has been updated successfully.`
        });
      } catch (err) {
        console.error("Error in updateProject:", err);
        toast({
          title: "Error updating project",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    },
    
    deleteProject: async (id) => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (error) {
          console.error("Error deleting project:", error);
          toast({
            title: "Error deleting project",
            description: error.message,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        dispatch({ type: "REMOVE_PROJECT", payload: id });
        toast({
          title: "Project deleted",
          description: "Project has been deleted successfully."
        });
      } catch (err) {
        console.error("Error in deleteProject:", err);
        toast({
          title: "Error deleting project",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    },
    
    createSprint: (sprintData) => {
      const newSprint = createSprint(sprintData);
      dispatch({ type: "ADD_SPRINT", payload: newSprint });
    },
    
    updateSprint: (id, sprintData) => {
      const updatedSprint = updateSprint(id, sprintData, state.sprints);
      if (updatedSprint) {
        dispatch({ type: "UPDATE_SPRINT", payload: updatedSprint });
      }
    },
    
    deleteSprint: (id) => {
      dispatch({ type: "REMOVE_SPRINT", payload: id });
      toast({
        title: "Sprint deleted",
        description: "Sprint has been deleted successfully."
      });
    },
    
    completeSprint: (id) => {
      dispatch({ type: "MARK_SPRINT_AS_COMPLETE", payload: id });
      toast({
        title: "Sprint completed",
        description: "The sprint has been marked as completed."
      });
    },
    
    createTask: (sprintId, columnId, taskData) => {
      const newTask = createTask(sprintId, columnId, taskData);
      dispatch({ type: "ADD_TASK", payload: newTask });
    },
    
    updateTask: (id, taskData) => {
      const updatedTask = updateTask(id, taskData, state.columns);
      if (updatedTask) {
        dispatch({ type: "UPDATE_TASK", payload: updatedTask });
      }
    },
    
    deleteTask: (id, columnId) => {
      dispatch({ type: "REMOVE_TASK", payload: { id, columnId } });
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully."
      });
    },
    
    moveTask: (taskId, sourceColumnId, targetColumnId) => {
      dispatch({ 
        type: "MOVE_TASK_TO_COLUMN", 
        payload: { taskId, sourceColumnId, targetColumnId } 
      });
    },
    
    createColumn: (title) => {
      const newColumn = createColumn(title);
      dispatch({ type: "ADD_COLUMN", payload: newColumn });
    },
    
    deleteColumn: (id) => {
      dispatch({ type: "REMOVE_COLUMN", payload: id });
      toast({
        title: "Column deleted",
        description: "Column has been deleted successfully."
      });
    },
    
    createBacklogItem: (backlogItemData) => {
      const newBacklogItem = createBacklogItem(backlogItemData);
      dispatch({ type: "ADD_BACKLOG_ITEM", payload: newBacklogItem });
    },
    
    updateBacklogItem: (id, backlogItemData) => {
      const updatedBacklogItem = updateBacklogItem(id, backlogItemData, state.backlogItems);
      if (updatedBacklogItem) {
        dispatch({ type: "UPDATE_BACKLOG_ITEM", payload: updatedBacklogItem });
      }
    },
    
    deleteBacklogItem: (id) => {
      dispatch({ type: "REMOVE_BACKLOG_ITEM", payload: id });
      toast({
        title: "Backlog item deleted",
        description: "Backlog item has been deleted successfully."
      });
    },
    
    moveBacklogItemToSprint: (backlogItemId, sprintId) => {
      dispatch({ 
        type: "MOVE_BACKLOG_ITEM_TO_SPRINT", 
        payload: { backlogItemId, sprintId } 
      });
      toast({
        title: "Item moved to sprint",
        description: "Backlog item has been moved to the sprint."
      });
    },
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
