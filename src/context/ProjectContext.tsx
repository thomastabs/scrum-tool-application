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
import { 
  deleteAllProjectsFromDB,
  deleteProjectFromDB,
  deleteSprintFromDB,
  getProjectsFromDB,
  getSprintsFromDB
} from "@/lib/supabase";
import { useAuth } from "./AuthContext";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const { user, isLoading } = useAuth();

  // Load data from Supabase when auth state changes
  useEffect(() => {
    if (user && !isLoading) {
      const loadProjects = async () => {
        try {
          const { data: projects, error } = await getProjectsFromDB();
          if (error) {
            toast({
              title: "Error loading projects",
              description: error.message,
              variant: "destructive"
            });
          } else if (projects) {
            dispatch({
              type: "LOAD_PROJECTS",
              payload: projects.map(project => ({
                ...project,
                createdAt: new Date(project.created_at),
                updatedAt: new Date(project.created_at)
              }))
            });
          }
        } catch (err) {
          console.error("Error loading projects:", err);
        }
      };

      const loadSprints = async () => {
        try {
          const { data: sprints, error } = await getSprintsFromDB();
          if (error) {
            toast({
              title: "Error loading sprints",
              description: error.message,
              variant: "destructive"
            });
          } else if (sprints) {
            dispatch({
              type: "LOAD_SPRINTS",
              payload: sprints.map(sprint => ({
                ...sprint,
                startDate: new Date(sprint.start_date),
                endDate: new Date(sprint.end_date),
                isCompleted: sprint.status === 'completed',
                createdAt: new Date(sprint.created_at),
                updatedAt: new Date(sprint.created_at)
              }))
            });
          }
        } catch (err) {
          console.error("Error loading sprints:", err);
        }
      };

      loadProjects();
      loadSprints();
    }
  }, [user, isLoading]);

  // Save state to localStorage (for backup and to maintain state between page refreshes)
  useEffect(() => {
    if (user) {
      localStorage.setItem(`projectState_${user.id}`, JSON.stringify(state));
    }
  }, [state, user]);

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
      
      toast({
        title: "Project created",
        description: "New project has been created successfully."
      });
    },
    
    updateProject: (id, projectData) => {
      const updatedProject = updateProject(id, projectData, state.projects);
      if (updatedProject) {
        dispatch({ type: "UPDATE_PROJECT", payload: updatedProject });
        
        toast({
          title: "Project updated",
          description: "Project has been updated successfully."
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
      
      toast({
        title: "Sprint created",
        description: "New sprint has been created successfully."
      });
    },
    
    updateSprint: (id, sprintData) => {
      const updatedSprint = updateSprint(id, sprintData, state.sprints);
      if (updatedSprint) {
        dispatch({ type: "UPDATE_SPRINT", payload: updatedSprint });
        toast({
          title: "Sprint updated",
          description: "Sprint has been updated successfully."
        });
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
