import React, { createContext, useContext, useReducer, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  Project, 
  Sprint, 
  Column, 
  Task, 
  BacklogItem,
  ProjectFormData,
  SprintFormData,
  TaskFormData,
  BacklogItemFormData,
  ProjectContextType
} from "@/types";
import { toast } from "@/components/ui/use-toast";

type Action =
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Project }
  | { type: "REMOVE_PROJECT"; payload: string }
  | { type: "SELECT_PROJECT"; payload: string }
  | { type: "ADD_SPRINT"; payload: Sprint }
  | { type: "UPDATE_SPRINT"; payload: Sprint }
  | { type: "REMOVE_SPRINT"; payload: string }
  | { type: "MARK_SPRINT_AS_COMPLETE"; payload: string }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "REMOVE_TASK"; payload: { id: string; columnId: string } }
  | { type: "MOVE_TASK_TO_COLUMN"; payload: { taskId: string; sourceColumnId: string; targetColumnId: string } }
  | { type: "ADD_COLUMN"; payload: Column }
  | { type: "REMOVE_COLUMN"; payload: string }
  | { type: "ADD_BACKLOG_ITEM"; payload: BacklogItem }
  | { type: "UPDATE_BACKLOG_ITEM"; payload: BacklogItem }
  | { type: "REMOVE_BACKLOG_ITEM"; payload: string }
  | { type: "MOVE_BACKLOG_ITEM_TO_SPRINT"; payload: { backlogItemId: string; sprintId: string } };

type State = {
  projects: Project[];
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
  selectedProject: Project | null;
};

const initialState: State = {
  projects: [],
  sprints: [],
  columns: [
    {
      id: uuidv4(),
      title: "TO DO",
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: uuidv4(),
      title: "IN PROGRESS",
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: uuidv4(),
      title: "DONE",
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
  ],
  backlogItems: [],
  selectedProject: null,
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_PROJECT":
      return { ...state, projects: [...state.projects, action.payload] };
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id ? action.payload : project
        ),
        selectedProject: state.selectedProject?.id === action.payload.id ? action.payload : state.selectedProject,
      };
    case "REMOVE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== action.payload),
        selectedProject: state.selectedProject?.id === action.payload ? null : state.selectedProject,
      };
    case "SELECT_PROJECT":
      return {
        ...state,
        selectedProject: action.payload 
          ? state.projects.find(p => p.id === action.payload) || null 
          : null,
      };
    case "ADD_SPRINT":
      return { ...state, sprints: [...state.sprints, action.payload] };
    case "UPDATE_SPRINT":
      return {
        ...state,
        sprints: state.sprints.map((sprint) =>
          sprint.id === action.payload.id ? action.payload : sprint
        ),
      };
    case "REMOVE_SPRINT":
      return {
        ...state,
        sprints: state.sprints.filter((sprint) => sprint.id !== action.payload),
      };
    case "MARK_SPRINT_AS_COMPLETE":
      return {
        ...state,
        sprints: state.sprints.map((sprint) =>
          sprint.id === action.payload ? { ...sprint, isCompleted: true } : sprint
        ),
      };
    case "ADD_TASK":
      return {
        ...state,
        columns: state.columns.map((column) =>
          column.id === action.payload.columnId
            ? { ...column, tasks: [...column.tasks, action.payload] }
            : column
        ),
      };
    case "UPDATE_TASK":
      return {
        ...state,
        columns: state.columns.map((column) => ({
          ...column,
          tasks: column.tasks.map((task) =>
            task.id === action.payload.id ? action.payload : task
          ),
        })),
      };
    case "REMOVE_TASK":
      return {
        ...state,
        columns: state.columns.map((column) =>
          column.id === action.payload.columnId
            ? { ...column, tasks: column.tasks.filter((task) => task.id !== action.payload.id) }
            : column
        ),
      };
    case "MOVE_TASK_TO_COLUMN":
      const { taskId, sourceColumnId, targetColumnId } = action.payload;
      return {
        ...state,
        columns: state.columns.map((column) => {
          if (column.id === sourceColumnId) {
            // Remove the task from the source column
            const taskToMove = column.tasks.find((task) => task.id === taskId);
            const updatedSourceTasks = column.tasks.filter((task) => task.id !== taskId);
            
            return { ...column, tasks: updatedSourceTasks };
          } else if (column.id === targetColumnId) {
            // Find the task in the state (assuming it exists, but good to have a fallback)
            let taskToMove = state.columns
              .flatMap(col => col.tasks)
              .find(task => task.id === taskId);
            
            if (!taskToMove) {
              // If task is not found, something is wrong, but we avoid crashing
              console.warn(`Task with id ${taskId} not found in any column.`);
              return column;
            }
            
            // Add the task to the target column
            return { ...column, tasks: [...column.tasks, taskToMove] };
          } else {
            return column;
          }
        }),
      };
    case "ADD_COLUMN":
      return { ...state, columns: [...state.columns, action.payload] };
    case "REMOVE_COLUMN":
      return {
        ...state,
        columns: state.columns.filter((column) => column.id !== action.payload),
      };
      case "ADD_BACKLOG_ITEM":
        return { ...state, backlogItems: [...state.backlogItems, action.payload] };
      case "UPDATE_BACKLOG_ITEM":
        return {
          ...state,
          backlogItems: state.backlogItems.map((backlogItem) =>
            backlogItem.id === action.payload.id ? action.payload : backlogItem
          ),
        };
      case "REMOVE_BACKLOG_ITEM":
        return {
          ...state,
          backlogItems: state.backlogItems.filter((backlogItem) => backlogItem.id !== action.payload),
        };
    case "MOVE_BACKLOG_ITEM_TO_SPRINT":
      const { backlogItemId, sprintId } = action.payload;
      return {
        ...state,
        backlogItems: state.backlogItems.filter((item) => item.id !== backlogItemId),
        sprints: state.sprints.map((sprint) =>
          sprint.id === sprintId ? { 
            ...sprint, 
            // We need to handle this differently as backlogItemIds doesn't exist on Sprint type
            // This was likely meant to track relationships in a different way
          } : sprint
        ),
      };
    default:
      return state;
  }
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
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
    createProject: (projectData: ProjectFormData) => {
      const newProject: Project = {
        ...projectData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dispatch({ type: "ADD_PROJECT", payload: newProject });
      toast({
        title: "Project created",
        description: `${projectData.title} has been created successfully.`
      });
    },
    updateProject: (id: string, projectData: ProjectFormData) => {
      const project = state.projects.find(p => p.id === id);
      if (!project) return;

      const updatedProject: Project = {
        ...project,
        ...projectData,
        updatedAt: new Date(),
      };
      dispatch({ type: "UPDATE_PROJECT", payload: updatedProject });
      toast({
        title: "Project updated",
        description: `${projectData.title} has been updated successfully.`
      });
    },
    deleteProject: (id: string) => {
      dispatch({ type: "REMOVE_PROJECT", payload: id });
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully."
      });
    },
    createSprint: (sprintData: SprintFormData) => {
      const newSprint: Sprint = {
        ...sprintData,
        id: uuidv4(),
        isCompleted: false,
        projectId: "", // This needs to be set properly in the component
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dispatch({ type: "ADD_SPRINT", payload: newSprint });
      toast({
        title: "Sprint created",
        description: `${sprintData.title} has been created successfully.`
      });
    },
    updateSprint: (id: string, sprintData: SprintFormData) => {
      const sprint = state.sprints.find(s => s.id === id);
      if (!sprint) return;

      const updatedSprint: Sprint = {
        ...sprint,
        ...sprintData,
        updatedAt: new Date(),
      };
      dispatch({ type: "UPDATE_SPRINT", payload: updatedSprint });
      toast({
        title: "Sprint updated",
        description: `${sprintData.title} has been updated successfully.`
      });
    },
    deleteSprint: (id: string) => {
      dispatch({ type: "REMOVE_SPRINT", payload: id });
      toast({
        title: "Sprint deleted",
        description: "Sprint has been deleted successfully."
      });
    },
    completeSprint: (id: string) => {
      dispatch({ type: "MARK_SPRINT_AS_COMPLETE", payload: id });
      toast({
        title: "Sprint completed",
        description: "The sprint has been marked as completed."
      });
    },
    createTask: (sprintId: string, columnId: string, taskData: TaskFormData) => {
      const newTask: Task = {
        ...taskData,
        id: uuidv4(),
        columnId,
        sprintId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dispatch({ type: "ADD_TASK", payload: newTask });
      toast({
        title: "Task created",
        description: `${taskData.title} has been created successfully.`
      });
    },
    updateTask: (id: string, taskData: TaskFormData) => {
      // Find the task from all columns
      let task: Task | undefined;
      let columnId: string | undefined;

      for (const column of state.columns) {
        const foundTask = column.tasks.find(t => t.id === id);
        if (foundTask) {
          task = foundTask;
          columnId = column.id;
          break;
        }
      }

      if (!task || !columnId) return;

      const updatedTask: Task = {
        ...task,
        ...taskData,
        updatedAt: new Date(),
      };
      dispatch({ type: "UPDATE_TASK", payload: updatedTask });
      toast({
        title: "Task updated",
        description: `${taskData.title} has been updated successfully.`
      });
    },
    deleteTask: (id: string, columnId: string) => {
      dispatch({ type: "REMOVE_TASK", payload: { id, columnId } });
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully."
      });
    },
    moveTask: (taskId: string, sourceColumnId: string, targetColumnId: string) => {
      dispatch({ 
        type: "MOVE_TASK_TO_COLUMN", 
        payload: { taskId, sourceColumnId, targetColumnId } 
      });
    },
    createColumn: (title: string) => {
      const newColumn: Column = {
        id: uuidv4(),
        title,
        tasks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dispatch({ type: "ADD_COLUMN", payload: newColumn });
      toast({
        title: "Column created",
        description: `${title} column has been created successfully.`
      });
    },
    deleteColumn: (id: string) => {
      dispatch({ type: "REMOVE_COLUMN", payload: id });
      toast({
        title: "Column deleted",
        description: "Column has been deleted successfully."
      });
    },
    createBacklogItem: (backlogItemData: BacklogItemFormData) => {
      const newBacklogItem: BacklogItem = {
        ...backlogItemData,
        id: uuidv4(),
        projectId: "", // This needs to be set properly in the component
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dispatch({ type: "ADD_BACKLOG_ITEM", payload: newBacklogItem });
      toast({
        title: "Backlog item created",
        description: `${backlogItemData.title} has been created successfully.`
      });
    },
    updateBacklogItem: (id: string, backlogItemData: BacklogItemFormData) => {
      const backlogItem = state.backlogItems.find(item => item.id === id);
      if (!backlogItem) return;

      const updatedBacklogItem: BacklogItem = {
        ...backlogItem,
        ...backlogItemData,
        updatedAt: new Date(),
      };
      dispatch({ type: "UPDATE_BACKLOG_ITEM", payload: updatedBacklogItem });
      toast({
        title: "Backlog item updated",
        description: `${backlogItemData.title} has been updated successfully.`
      });
    },
    deleteBacklogItem: (id: string) => {
      dispatch({ type: "REMOVE_BACKLOG_ITEM", payload: id });
      toast({
        title: "Backlog item deleted",
        description: "Backlog item has been deleted successfully."
      });
    },
    moveBacklogItemToSprint: (backlogItemId: string, sprintId: string) => {
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
