
import React, { createContext, useContext, useReducer, useEffect } from "react";
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
import { deleteProjectFromDB, deleteSprintFromDB, supabase } from "@/lib/supabase";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState, () => {
    const localData = localStorage.getItem("projectState");
    return localData ? JSON.parse(localData) : initialState;
  });

  useEffect(() => {
    localStorage.setItem("projectState", JSON.stringify(state));
  }, [state]);

  // Helper function to get current user ID
  const getCurrentUser = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        return null;
      }
      return data.session?.user?.id || null;
    } catch (error) {
      console.error("Exception getting user session:", error);
      return null;
    }
  };

  const contextValue: ProjectContextType = {
    projects: state.projects,
    sprints: state.sprints,
    columns: state.columns,
    backlogItems: state.backlogItems,
    selectedProject: state.selectedProject,
    
    selectProject: (id: string) => {
      dispatch({ type: "SELECT_PROJECT", payload: id });
    },
    
    createProject: (projectData) => {
      const newProject = createProject(projectData);
      dispatch({ type: "ADD_PROJECT", payload: newProject });
    },
    
    updateProject: (id, projectData) => {
      const updatedProject = updateProject(id, projectData, state.projects);
      if (updatedProject) {
        dispatch({ type: "UPDATE_PROJECT", payload: updatedProject });
      }
    },
    
    deleteProject: async (id) => {
      // Remove the project from local state
      dispatch({ type: "REMOVE_PROJECT", payload: id });
      
      // Remove any sprints associated with this project
      state.sprints
        .filter(sprint => sprint.projectId === id)
        .forEach(sprint => {
          dispatch({ type: "REMOVE_SPRINT", payload: sprint.id });
        });
      
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully."
      });
    },
    
    createSprint: async (sprintData) => {
      // Get current user ID for the sprint creation
      const userId = await getCurrentUser();
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to create a sprint",
          variant: "destructive"
        });
        return;
      }

      const newSprint = createSprint(sprintData);
      
      // Attempt to create in DB with user_id
      try {
        const { data, error } = await supabase.from('sprints').insert({
          project_id: sprintData.projectId,
          user_id: userId,
          title: sprintData.title,
          description: sprintData.description,
          start_date: sprintData.startDate.toISOString(),
          end_date: sprintData.endDate.toISOString(),
          duration: Math.ceil((sprintData.endDate.getTime() - sprintData.startDate.getTime()) / (1000 * 60 * 60 * 24))
          // removed status and justification fields
        }).select().single();
        
        if (error) {
          console.error("Error creating sprint in DB:", error);
          toast({
            title: "Error",
            description: "Failed to create sprint. Please try again.",
            variant: "destructive"
          });
          throw error;
        }
        
        // Update with DB data
        newSprint.id = data.id;
        dispatch({ type: "ADD_SPRINT", payload: newSprint });
        
        toast({
          title: "Sprint created",
          description: `${sprintData.title} has been created successfully.`
        });
      } catch (error) {
        console.error("Error creating sprint in DB:", error);
        toast({
          title: "Error",
          description: "Failed to create sprint. Please try again.",
          variant: "destructive"
        });
      }
    },
    
    updateSprint: (id, sprintData) => {
      const updatedSprint = updateSprint(id, sprintData, state.sprints);
      if (updatedSprint) {
        dispatch({ type: "UPDATE_SPRINT", payload: updatedSprint });
      }
    },
    
    deleteSprint: async (id) => {
      try {
        // First delete from DB
        const { error } = await deleteSprintFromDB(id);
        if (error) throw error;
        
        // Then update local state
        dispatch({ type: "REMOVE_SPRINT", payload: id });
        
        toast({
          title: "Sprint deleted",
          description: "Sprint has been deleted successfully."
        });
      } catch (error) {
        console.error("Error deleting sprint:", error);
        toast({
          title: "Error",
          description: "Failed to delete sprint. Please try again.",
          variant: "destructive"
        });
      }
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
