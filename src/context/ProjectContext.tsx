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
  deleteSprintFromDB
} from "@/lib/supabase";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState, () => {
    const localData = localStorage.getItem("projectState");
    return localData ? JSON.parse(localData) : initialState;
  });

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
      
      // Set the projectId based on the selected project
      if (state.selectedProject) {
        newTask.projectId = state.selectedProject.id;
      }
      
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
    
    createColumn: (title: string) => {
      // We need to determine which sprint this column belongs to
      // If we have sprints for the selected project, use the first one
      const projectSprints = state.sprints.filter(s => 
        state.selectedProject && s.projectId === state.selectedProject.id
      );
      const sprintId = projectSprints.length > 0 ? projectSprints[0].id : "";
      
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
