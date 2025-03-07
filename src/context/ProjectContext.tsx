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
  updateBacklogItem,
  createDefaultColumns
} from "./projectActions";
import { toast } from "@/components/ui/use-toast";
import { 
  deleteAllProjectsFromDB,
  deleteProjectFromDB,
  deleteSprintFromDB,
  getProjectsFromDB,
  createProjectInDB,
  updateProjectInDB
} from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  
  // Load data from Supabase on login/initial load
  useEffect(() => {
    const loadProjects = async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (session.session) {
        const { data: projectsData, error } = await getProjectsFromDB();
        
        if (error) {
          console.error("Error loading projects:", error);
          toast({
            title: "Error loading projects",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        if (projectsData) {
          // Transform data from DB format to app format
          const formattedProjects = projectsData.map(proj => ({
            id: proj.id,
            title: proj.title,
            description: proj.description || "",
            endGoal: proj.end_goal || "",
            createdAt: new Date(proj.created_at),
            updatedAt: new Date(proj.updated_at),
          }));
          
          // Add all projects to state
          dispatch({ type: "SET_PROJECTS", payload: formattedProjects });
        }
      } else {
        // Use local storage as fallback when not logged in
        const localData = localStorage.getItem("projectState");
        if (localData) {
          dispatch({ type: "LOAD_STATE", payload: JSON.parse(localData) });
        }
      }
    };
    
    loadProjects();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loadProjects();
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: "CLEAR_ALL_PROJECTS" });
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Save to localStorage as backup
  useEffect(() => {
    localStorage.setItem("projectState", JSON.stringify(state));
  }, [state]);

  const contextValue: ProjectContextType = {
    projects: state.projects,
    sprints: state.sprints,
    columns: state.columns,
    backlogItems: state.backlogItems,
    selectedProject: state.selectedProject,
    
    selectProject: (id: string) => {
      dispatch({ type: "SELECT_PROJECT", payload: id });
    },
    
    createProject: async (projectData) => {
      try {
        // First create in database
        const { data: newProjectData, error } = await createProjectInDB(projectData);
        
        if (error) {
          toast({
            title: "Error creating project",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        if (newProjectData) {
          // Transform from DB format to app format
          const newProject = {
            id: newProjectData.id,
            title: newProjectData.title,
            description: newProjectData.description || "",
            endGoal: newProjectData.end_goal || "",
            createdAt: new Date(newProjectData.created_at),
            updatedAt: new Date(newProjectData.updated_at),
          };
          
          // Then update local state
          dispatch({ type: "ADD_PROJECT", payload: newProject });
          
          toast({
            title: "Project created",
            description: `${projectData.title} has been created successfully.`
          });
        }
      } catch (err) {
        console.error("Error in createProject:", err);
        toast({
          title: "Error creating project",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    updateProject: async (id, projectData) => {
      try {
        // First update in database
        const { data: updatedProjectData, error } = await updateProjectInDB(id, projectData);
        
        if (error) {
          toast({
            title: "Error updating project",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        if (updatedProjectData) {
          // Transform from DB format to app format
          const updatedProject = {
            id: updatedProjectData.id,
            title: updatedProjectData.title,
            description: updatedProjectData.description || "",
            endGoal: updatedProjectData.end_goal || "",
            createdAt: new Date(updatedProjectData.created_at),
            updatedAt: new Date(updatedProjectData.updated_at),
          };
          
          // Then update local state
          dispatch({ type: "UPDATE_PROJECT", payload: updatedProject });
          
          toast({
            title: "Project updated",
            description: `${projectData.title} has been updated successfully.`
          });
        }
      } catch (err) {
        console.error("Error in updateProject:", err);
        toast({
          title: "Error updating project",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    deleteProject: (id) => {
      deleteProjectFromDB(id)
        .then(({ error }) => {
          if (error) {
            toast({
              title: "Error deleting project",
              description: error.message,
              variant: "destructive"
            });
          } else {
            dispatch({ type: "REMOVE_PROJECT", payload: id });
            toast({
              title: "Project deleted",
              description: "Project has been deleted successfully."
            });
          }
        });
    },
    
    deleteAllProjects: () => {
      deleteAllProjectsFromDB()
        .then(({ error }) => {
          if (error) {
            toast({
              title: "Error deleting projects",
              description: error.message,
              variant: "destructive"
            });
          } else {
            // Clear all projects from state
            dispatch({ type: "CLEAR_ALL_PROJECTS" });
            toast({
              title: "All projects deleted",
              description: "All projects have been deleted successfully."
            });
          }
        });
    },
    
    createSprint: (sprintData) => {
      const newSprint = createSprint(sprintData);
      dispatch({ type: "ADD_SPRINT", payload: newSprint });
      
      // Create default columns for the new sprint
      const defaultColumns = createDefaultColumns(newSprint.id);
      defaultColumns.forEach(column => {
        dispatch({ type: "ADD_COLUMN", payload: column });
      });
    },
    
    updateSprint: (id, sprintData) => {
      const updatedSprint = updateSprint(id, sprintData, state.sprints);
      if (updatedSprint) {
        dispatch({ type: "UPDATE_SPRINT", payload: updatedSprint });
      }
    },
    
    deleteSprint: (id) => {
      deleteSprintFromDB(id)
        .then(({ error }) => {
          if (error) {
            toast({
              title: "Error deleting sprint",
              description: error.message,
              variant: "destructive"
            });
          } else {
            dispatch({ type: "REMOVE_SPRINT", payload: id });
            toast({
              title: "Sprint deleted",
              description: "Sprint has been deleted successfully."
            });
          }
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
    
    createColumn: (title, sprintId) => {
      const newColumn = createColumn(title, sprintId);
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
