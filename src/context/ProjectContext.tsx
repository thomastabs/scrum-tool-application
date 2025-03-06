import React, { createContext, useContext, useReducer, useEffect } from "react";
import { ProjectContextType } from "@/types";
import { projectReducer, initialState } from "./projectReducer";
import { 
  createProject, 
  updateProject, 
  createSprint, 
  updateTask, 
  createColumn, 
  createBacklogItem, 
  updateBacklogItem 
} from "./projectActions";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Project, ProjectFormData } from "@/types";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // Fetch projects from local storage on initial load
  useEffect(() => {
    const localData = localStorage.getItem("projectState");
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        // Initialize with local data, will be replaced with DB data when fetchProjects is called
        dispatch({ type: "INITIALIZE_STATE", payload: parsedData });
      } catch (error) {
        console.error("Error parsing local storage data:", error);
      }
    }
  }, []);

  // Save state to local storage when it changes (as a backup)
  useEffect(() => {
    localStorage.setItem("projectState", JSON.stringify(state));
  }, [state]);

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access your projects",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Transform the database projects to match our frontend model
        const frontendProjects: Project[] = data.map(dbProject => ({
          id: dbProject.id,
          title: dbProject.title || 'Untitled Project',
          description: dbProject.description || '',
          endGoal: dbProject.end_goal || '',
          createdAt: new Date(dbProject.created_at),
          updatedAt: new Date(dbProject.created_at),
        }));

        dispatch({ type: "SET_PROJECTS", payload: frontendProjects });
        return frontendProjects;
      }
    } catch (error: any) {
      toast({
        title: "Error fetching projects",
        description: error.message || "Could not load your projects",
        variant: "destructive"
      });
      console.error("Error fetching projects:", error);
      throw error;
    }
  };

  // Create project in Supabase
  const createProjectInDb = async (projectData: ProjectFormData) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a project",
          variant: "destructive"
        });
        return null;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description,
          end_goal: projectData.endGoal,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newProject: Project = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          endGoal: data.end_goal || '',
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.created_at),
        };

        dispatch({ type: "ADD_PROJECT", payload: newProject });
        return newProject;
      }
    } catch (error: any) {
      toast({
        title: "Error creating project",
        description: error.message || "Could not create your project",
        variant: "destructive"
      });
      console.error("Error creating project:", error);
      return null;
    }
  };

  // Update project in Supabase
  const updateProjectInDb = async (id: string, projectData: ProjectFormData) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          title: projectData.title,
          description: projectData.description,
          end_goal: projectData.endGoal,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const updatedProject: Project = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          endGoal: data.end_goal || '',
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at || data.created_at),
        };

        dispatch({ type: "UPDATE_PROJECT", payload: updatedProject });
        return updatedProject;
      }
    } catch (error: any) {
      toast({
        title: "Error updating project",
        description: error.message || "Could not update your project",
        variant: "destructive"
      });
      console.error("Error updating project:", error);
      return null;
    }
  };

  // Delete project from Supabase
  const deleteProjectFromDb = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      dispatch({ type: "REMOVE_PROJECT", payload: id });
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting project",
        description: error.message || "Could not delete your project",
        variant: "destructive"
      });
      console.error("Error deleting project:", error);
    }
  };

  const contextValue: ProjectContextType = {
    projects: state.projects,
    sprints: state.sprints,
    columns: state.columns,
    backlogItems: state.backlogItems,
    selectedProject: state.selectedProject,
    fetchProjects,

    selectProject: (id: string) => {
      dispatch({ type: "SELECT_PROJECT", payload: id });
    },
    
    createProject: async (projectData) => {
      await createProjectInDb(projectData);
    },
    
    updateProject: async (id, projectData) => {
      await updateProjectInDb(id, projectData);
    },
    
    deleteProject: async (id) => {
      await deleteProjectFromDb(id);
    },
    
    createSprint: (sprintData) => {
      const newSprint = createSprint(sprintData);
      dispatch({ type: "ADD_SPRINT", payload: newSprint });
    },
    
    updateSprint: (id, sprintData) => {
      // const updatedSprint = updateSprint(id, sprintData, state.sprints);
      // if (updatedSprint) {
      //   dispatch({ type: "UPDATE_SPRINT", payload: updatedSprint });
      // }
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
      const newTask = updateTask(sprintId, columnId, taskData);
      dispatch({ type: "ADD_TASK", payload: newTask });
    },
    
    updateTask: (id, taskData) => {
      // const updatedTask = updateTask(id, taskData, state.columns);
      // if (updatedTask) {
      //   dispatch({ type: "UPDATE_TASK", payload: updatedTask });
      // }
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
