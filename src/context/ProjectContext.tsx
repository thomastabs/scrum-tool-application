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
  updateProjectInDB,
  getSprintsFromDB,
  createSprintInDB,
  updateSprintInDB,
  completeSprintInDB,
  getColumnsFromDB,
  createColumnInDB,
  deleteColumnFromDB,
  getTasksFromDB,
  createTaskInDB,
  updateTaskInDB,
  moveTaskToColumnInDB,
  deleteTaskFromDB,
  getBacklogItemsFromDB,
  createBacklogItemInDB,
  updateBacklogItemInDB,
  moveBacklogItemToSprintInDB,
  deleteBacklogItemFromDB
} from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  
  // Load data from Supabase on login/initial load
  useEffect(() => {
    const loadData = async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (session.session) {
        try {
          // Load projects
          const { data: projectsData, error: projectsError } = await getProjectsFromDB();
          
          if (projectsError) {
            console.error("Error loading projects:", projectsError);
            toast({
              title: "Error loading projects",
              description: projectsError.message,
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
          
          // Load sprints
          const { data: sprintsData, error: sprintsError } = await getSprintsFromDB();
          
          if (sprintsError) {
            console.error("Error loading sprints:", sprintsError);
            return;
          }
          
          if (sprintsData) {
            // Transform data from DB format to app format
            const formattedSprints = sprintsData.map(sprint => ({
              id: sprint.id,
              title: sprint.title,
              description: sprint.description || "",
              startDate: new Date(sprint.start_date),
              endDate: new Date(sprint.end_date),
              isCompleted: sprint.status === 'completed',
              projectId: sprint.project_id,
              createdAt: new Date(sprint.created_at),
              updatedAt: new Date(sprint.updated_at),
            }));
            
            // Add all sprints to state
            dispatch({ type: "SET_SPRINTS", payload: formattedSprints });
          }
          
          // Load columns
          const { data: columnsData, error: columnsError } = await getColumnsFromDB();
          
          if (columnsError) {
            console.error("Error loading columns:", columnsError);
            return;
          }
          
          if (columnsData) {
            // Load tasks to associate with columns
            const { data: tasksData, error: tasksError } = await getTasksFromDB();
            
            if (tasksError) {
              console.error("Error loading tasks:", tasksError);
              return;
            }
            
            // Transform columns data from DB format to app format
            const formattedColumns = columnsData.map(column => {
              // Find tasks for this column
              const columnTasks = tasksData ? tasksData
                .filter(task => task.column_id === column.id && task.status !== 'backlog')
                .map(task => ({
                  id: task.id,
                  title: task.title,
                  description: task.description || "",
                  priority: task.priority,
                  storyPoints: task.story_points,
                  assignee: task.assignee,
                  sprintId: task.sprint_id,
                  columnId: task.column_id,
                  createdAt: new Date(task.created_at),
                  updatedAt: new Date(),
                })) : [];
              
              return {
                id: column.id,
                title: column.title,
                tasks: columnTasks,
                order_index: column.order_index,
                sprint_id: column.sprint_id,
                created_at: new Date(column.created_at),
                createdAt: new Date(column.created_at),
                updatedAt: new Date(),
              };
            });
            
            // Add all columns to state
            dispatch({ type: "SET_COLUMNS", payload: formattedColumns });
            
            // Now handle backlog items (tasks with status=backlog)
            if (tasksData) {
              const backlogItems = tasksData
                .filter(task => task.status === 'backlog')
                .map(task => ({
                  id: task.id,
                  title: task.title,
                  description: task.description || "",
                  priority: task.priority,
                  storyPoints: task.story_points,
                  projectId: task.project_id,
                  createdAt: new Date(task.created_at),
                  updatedAt: new Date(),
                }));
              
              dispatch({ type: "SET_BACKLOG_ITEMS", payload: backlogItems });
            }
          }
          
        } catch (err) {
          console.error("Error in data loading:", err);
          toast({
            title: "Error loading data",
            description: "An unexpected error occurred while loading your data.",
            variant: "destructive"
          });
        }
      } else {
        // Use local storage as fallback when not logged in
        const localData = localStorage.getItem("projectState");
        if (localData) {
          dispatch({ type: "LOAD_STATE", payload: JSON.parse(localData) });
        }
      }
    };
    
    loadData();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loadData();
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
    
    createSprint: async (sprintData) => {
      try {
        // First create in database
        const { data: newSprintData, error } = await createSprintInDB(sprintData);
        
        if (error) {
          toast({
            title: "Error creating sprint",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        if (newSprintData) {
          // Transform from DB format to app format
          const newSprint = {
            id: newSprintData.id,
            title: newSprintData.title,
            description: newSprintData.description || "",
            startDate: new Date(newSprintData.start_date),
            endDate: new Date(newSprintData.end_date),
            isCompleted: newSprintData.status === 'completed',
            projectId: newSprintData.project_id,
            createdAt: new Date(newSprintData.created_at),
            updatedAt: new Date(newSprintData.updated_at),
          };
          
          // Then update local state
          dispatch({ type: "ADD_SPRINT", payload: newSprint });
          
          // Load the columns that were created by the trigger
          const { data: columnsData } = await getColumnsFromDB();
          if (columnsData) {
            const newColumns = columnsData
              .filter(col => col.sprint_id === newSprintData.id)
              .map(col => ({
                id: col.id,
                title: col.title,
                tasks: [],
                order_index: col.order_index,
                sprint_id: col.sprint_id,
                created_at: new Date(col.created_at),
                createdAt: new Date(col.created_at),
                updatedAt: new Date(),
              }));
            
            // Add the new columns to state
            newColumns.forEach(column => {
              dispatch({ type: "ADD_COLUMN", payload: column });
            });
          }
          
          toast({
            title: "Sprint created",
            description: `${sprintData.title} has been created successfully.`
          });
        }
      } catch (err) {
        console.error("Error in createSprint:", err);
        toast({
          title: "Error creating sprint",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    updateSprint: async (id, sprintData) => {
      try {
        // First update in database
        const { data: updatedSprintData, error } = await updateSprintInDB(id, sprintData);
        
        if (error) {
          toast({
            title: "Error updating sprint",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        if (updatedSprintData) {
          // Transform from DB format to app format
          const updatedSprint = {
            id: updatedSprintData.id,
            title: updatedSprintData.title,
            description: updatedSprintData.description || "",
            startDate: new Date(updatedSprintData.start_date),
            endDate: new Date(updatedSprintData.end_date),
            isCompleted: updatedSprintData.status === 'completed',
            projectId: updatedSprintData.project_id,
            createdAt: new Date(updatedSprintData.created_at),
            updatedAt: new Date(updatedSprintData.updated_at),
          };
          
          // Then update local state
          dispatch({ type: "UPDATE_SPRINT", payload: updatedSprint });
          
          toast({
            title: "Sprint updated",
            description: `${sprintData.title} has been updated successfully.`
          });
        }
      } catch (err) {
        console.error("Error in updateSprint:", err);
        toast({
          title: "Error updating sprint",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    deleteSprint: async (id) => {
      try {
        const { error } = await deleteSprintFromDB(id);
        
        if (error) {
          toast({
            title: "Error deleting sprint",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        // Update local state
        dispatch({ type: "REMOVE_SPRINT", payload: id });
        
        toast({
          title: "Sprint deleted",
          description: "Sprint has been deleted successfully."
        });
      } catch (err) {
        console.error("Error in deleteSprint:", err);
        toast({
          title: "Error deleting sprint",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    completeSprint: async (id) => {
      try {
        const { error } = await completeSprintInDB(id);
        
        if (error) {
          toast({
            title: "Error completing sprint",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        // Update local state
        dispatch({ type: "MARK_SPRINT_AS_COMPLETE", payload: id });
        
        toast({
          title: "Sprint completed",
          description: "The sprint has been marked as completed."
        });
      } catch (err) {
        console.error("Error in completeSprint:", err);
        toast({
          title: "Error completing sprint",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    createTask: async (sprintId, columnId, taskData) => {
      try {
        // Find the project ID for this sprint
        const sprint = state.sprints.find(s => s.id === sprintId);
        if (!sprint) {
          toast({
            title: "Error creating task",
            description: "Sprint not found.",
            variant: "destructive"
          });
          return;
        }
        
        const projectId = sprint.projectId;
        
        // Create in database
        const { data: newTaskData, error } = await createTaskInDB(
          taskData, sprintId, columnId, projectId
        );
        
        if (error) {
          toast({
            title: "Error creating task",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        if (newTaskData) {
          // Transform from DB format to app format
          const newTask = {
            id: newTaskData.id,
            title: newTaskData.title,
            description: newTaskData.description || "",
            priority: newTaskData.priority,
            storyPoints: newTaskData.story_points,
            assignee: newTaskData.assignee,
            sprintId: newTaskData.sprint_id,
            columnId: newTaskData.column_id,
            createdAt: new Date(newTaskData.created_at),
            updatedAt: new Date(),
          };
          
          // Update local state
          dispatch({ type: "ADD_TASK", payload: newTask });
          
          toast({
            title: "Task created",
            description: `${taskData.title} has been created successfully.`
          });
        }
      } catch (err) {
        console.error("Error in createTask:", err);
        toast({
          title: "Error creating task",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    updateTask: async (id, taskData) => {
      try {
        // Update in database
        const { data: updatedTaskData, error } = await updateTaskInDB(id, taskData);
        
        if (error) {
          toast({
            title: "Error updating task",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        if (updatedTaskData) {
          // Transform from DB format to app format
          const updatedTask = {
            id: updatedTaskData.id,
            title: updatedTaskData.title,
            description: updatedTaskData.description || "",
            priority: updatedTaskData.priority,
            storyPoints: updatedTaskData.story_points,
            assignee: updatedTaskData.assignee,
            sprintId: updatedTaskData.sprint_id,
            columnId: updatedTaskData.column_id,
            createdAt: new Date(updatedTaskData.created_at),
            updatedAt: new Date(),
          };
          
          // Update local state
          dispatch({ type: "UPDATE_TASK", payload: updatedTask });
          
          toast({
            title: "Task updated",
            description: `${taskData.title} has been updated successfully.`
          });
        }
      } catch (err) {
        console.error("Error in updateTask:", err);
        toast({
          title: "Error updating task",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    deleteTask: async (id, columnId) => {
      try {
        const { error } = await deleteTaskFromDB(id);
        
        if (error) {
          toast({
            title: "Error deleting task",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        // Update local state
        dispatch({ type: "REMOVE_TASK", payload: { id, columnId } });
        
        toast({
          title: "Task deleted",
          description: "Task has been deleted successfully."
        });
      } catch (err) {
        console.error("Error in deleteTask:", err);
        toast({
          title: "Error deleting task",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    moveTask: async (taskId, sourceColumnId, targetColumnId) => {
      try {
        const { data: updatedTaskData, error } = await moveTaskToColumnInDB(
          taskId, targetColumnId
        );
        
        if (error) {
          toast({
            title: "Error moving task",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        // Update local state with current timestamp
        dispatch({ 
          type: "MOVE_TASK_TO_COLUMN", 
          payload: { taskId, sourceColumnId, targetColumnId, timestamp: new Date() } 
        });
      } catch (err) {
        console.error("Error in moveTask:", err);
        toast({
          title: "Error moving task",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    createColumn: async (title, sprintId) => {
      try {
        // Find the max order index for this sprint to add new column at the end
        const sprintColumns = state.columns.filter(col => col.sprint_id === sprintId);
        const maxOrderIndex = sprintColumns.length > 0 
          ? Math.max(...sprintColumns.map(col => col.order_index)) 
          : -1;
        const newOrderIndex = maxOrderIndex + 1;
        
        const { data: newColumnData, error } = await createColumnInDB(
          title, sprintId, newOrderIndex
        );
        
        if (error) {
          toast({
            title: "Error creating column",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        if (newColumnData) {
          // Transform from DB format to app format
          const newColumn = {
            id: newColumnData.id,
            title: newColumnData.title,
            tasks: [],
            order_index: newColumnData.order_index,
            sprint_id: newColumnData.sprint_id,
            created_at: new Date(newColumnData.created_at),
            createdAt: new Date(newColumnData.created_at),
            updatedAt: new Date(),
          };
          
          // Update local state
          dispatch({ type: "ADD_COLUMN", payload: newColumn });
          
          toast({
            title: "Column created",
            description: `${title} column has been created successfully.`
          });
        }
      } catch (err) {
        console.error("Error in createColumn:", err);
        toast({
          title: "Error creating column",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    deleteColumn: async (id) => {
      try {
        const { error } = await deleteColumnFromDB(id);
        
        if (error) {
          toast({
            title: "Error deleting column",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        // Update local state
        dispatch({ type: "REMOVE_COLUMN", payload: id });
        
        toast({
          title: "Column deleted",
          description: "Column has been deleted successfully."
        });
      } catch (err) {
        console.error("Error in deleteColumn:", err);
        toast({
          title: "Error deleting column",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    createBacklogItem: async (backlogItemData) => {
      try {
        const { data: newItemData, error } = await createBacklogItemInDB(backlogItemData);
        
        if (error) {
          toast({
            title: "Error creating backlog item",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        if (newItemData) {
          // Transform from DB format to app format
          const newBacklogItem = {
            id: newItemData.id,
            title: newItemData.title,
            description: newItemData.description || "",
            priority: newItemData.priority,
            storyPoints: newItemData.story_points,
            projectId: newItemData.project_id,
            createdAt: new Date(newItemData.created_at),
            updatedAt: new Date(),
          };
          
          // Update local state
          dispatch({ type: "ADD_BACKLOG_ITEM", payload: newBacklogItem });
          
          toast({
            title: "Backlog item created",
            description: `${backlogItemData.title} has been created successfully.`
          });
        }
      } catch (err) {
        console.error("Error in createBacklogItem:", err);
        toast({
          title: "Error creating backlog item",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    updateBacklogItem: async (id, backlogItemData) => {
      try {
        const { data: updatedItemData, error } = await updateBacklogItemInDB(
          id, backlogItemData
        );
        
        if (error) {
          toast({
            title: "Error updating backlog item",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        if (updatedItemData) {
          // Transform from DB format to app format
          const updatedBacklogItem = {
            id: updatedItemData.id,
            title: updatedItemData.title,
            description: updatedItemData.description || "",
            priority: updatedItemData.priority,
            storyPoints: updatedItemData.story_points,
            projectId: updatedItemData.project_id,
            createdAt: new Date(updatedItemData.created_at),
            updatedAt: new Date(),
          };
          
          // Update local state
          dispatch({ type: "UPDATE_BACKLOG_ITEM", payload: updatedBacklogItem });
          
          toast({
            title: "Backlog item updated",
            description: `${backlogItemData.title} has been updated successfully.`
          });
        }
      } catch (err) {
        console.error("Error in updateBacklogItem:", err);
        toast({
          title: "Error updating backlog item",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    deleteBacklogItem: async (id) => {
      try {
        const { error } = await deleteBacklogItemFromDB(id);
        
        if (error) {
          toast({
            title: "Error deleting backlog item",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        // Update local state
        dispatch({ type: "REMOVE_BACKLOG_ITEM", payload: id });
        
        toast({
          title: "Backlog item deleted",
          description: "Backlog item has been deleted successfully."
        });
      } catch (err) {
        console.error("Error in deleteBacklogItem:", err);
        toast({
          title: "Error deleting backlog item",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    },
    
    moveBacklogItemToSprint: async (backlogItemId, sprintId) => {
      try {
        const { data: updatedItemData, error } = await moveBacklogItemToSprintInDB(
          backlogItemId, sprintId
        );
        
        if (error) {
          toast({
            title: "Error moving backlog item",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        if (updatedItemData) {
          // Update local state
          dispatch({ 
            type: "MOVE_BACKLOG_ITEM_TO_SPRINT", 
            payload: { backlogItemId, sprintId } 
          });
          
          toast({
            title: "Item moved to sprint",
            description: "Backlog item has been moved to the sprint."
          });
        }
      } catch (err) {
        console.error("Error in moveBacklogItemToSprint:", err);
        toast({
          title: "Error moving backlog item",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
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
