
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
import { getProjectsFromDB, supabase } from "@/lib/supabase";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const [loading, setLoading] = useState(true);

  // Function to fetch projects
  const fetchProjects = async () => {
    console.log("Fetching projects from ProjectContext...");
    setLoading(true);
    
    try {
      // Clear existing projects first before fetching new ones
      dispatch({ type: "CLEAR_PROJECTS" });
      
      const { data, error } = await getProjectsFromDB();
      
      if (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error",
          description: "Failed to fetch projects. Please try again.",
          variant: "destructive",
        });
        return;
      } 
      
      if (!data || data.length === 0) {
        console.log("No projects found for this user");
        setLoading(false);
        return;
      }
      
      console.log("Projects fetched successfully:", data);
      
      // Add the newly fetched projects
      data.forEach(project => {
        dispatch({ 
          type: "ADD_PROJECT", 
          payload: {
            id: project.id,
            title: project.title,
            description: project.description || "",
            endGoal: project.end_goal || "",
            owner_id: project.owner_id,
            collaborators: project.collaborators || [],
            createdAt: new Date(project.created_at),
            updatedAt: new Date(project.updated_at || project.created_at)
          } 
        });
      });
    } catch (err) {
      console.error("Unexpected error in fetchProjects:", err);
      toast({
        title: "Error",
        description: "Something went wrong while fetching projects.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Use a more robust approach to auth state changes and session management
  useEffect(() => {
    // Check if user is already signed in and fetch projects
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log("Session found at mount, user ID:", data.session.user.id);
          // We have a valid session, fetch projects
          await fetchProjects();
        } else {
          console.log("No session found at mount");
          // No session, ensure projects are cleared
          dispatch({ type: "CLEAR_PROJECTS" });
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // User signed in or token refreshed, fetch projects
        await fetchProjects();
      } else if (event === 'SIGNED_OUT') {
        // User signed out, clear projects
        console.log("User signed out, clearing projects");
        dispatch({ type: "CLEAR_PROJECTS" });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const contextValue: ProjectContextType = {
    projects: state.projects,
    sprints: state.sprints,
    columns: state.columns,
    backlogItems: state.backlogItems,
    selectedProject: state.selectedProject,
    loading,
    
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
    
    deleteProject: (id) => {
      dispatch({ type: "REMOVE_PROJECT", payload: id });
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully."
      });
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
