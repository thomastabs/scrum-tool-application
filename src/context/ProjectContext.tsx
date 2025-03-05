import React, { createContext, useContext, useReducer, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  Project, 
  Sprint, 
  Column, 
  Task, 
  BacklogItem,
} from "@/types";
import { 
  addProject, 
  updateProject, 
  removeProject 
} from "./actions/projectActions";
import { 
  addSprint, 
  updateSprint, 
  removeSprint, 
  markSprintAsComplete 
} from "./actions/sprintActions";
import { 
  addTask, 
  updateTask, 
  removeTask, 
  moveTaskToColumn 
} from "./actions/taskActions";
import { 
  addColumn, 
  removeColumn 
} from "./actions/columnActions";
import { 
  addBacklogItem, 
  updateBacklogItem, 
  removeBacklogItem, 
  moveBacklogItemToSprint 
} from "./actions/backlogActions";

type ProjectContextType = {
  projects: Project[];
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
  createProject: (project: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  createSprint: (sprint: Omit<Sprint, "id" | "isCompleted">) => void;
  updateSprint: (sprint: Sprint) => void;
  deleteSprint: (id: string) => void;
  completeSprint: (id: string) => void;
  createTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string, columnId: string) => void;
  moveTask: (taskId: string, sourceColumnId: string, targetColumnId: string) => void;
  createColumn: (title: string) => void;
  deleteColumn: (id: string) => void;
  createBacklogItem: (backlogItem: Omit<BacklogItem, "id" | "createdAt">) => void;
  updateBacklogItem: (backlogItem: BacklogItem) => void;
  deleteBacklogItem: (id: string) => void;
  moveBacklogItemToSprint: (backlogItemId: string, sprintId: string) => void;
};

type Action =
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Project }
  | { type: "REMOVE_PROJECT"; payload: string }
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
};

const initialState: State = {
  projects: [],
  sprints: [],
  columns: [
    {
      id: uuidv4(),
      title: "TO DO",
      tasks: [],
    },
    {
      id: uuidv4(),
      title: "IN PROGRESS",
      tasks: [],
    },
    {
      id: uuidv4(),
      title: "DONE",
      tasks: [],
    },
  ],
  backlogItems: [],
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
      };
    case "REMOVE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== action.payload),
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
              sprint.id === sprintId ? { ...sprint, backlogItemIds: [...sprint.backlogItemIds || [], backlogItemId] } : sprint
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

  const contextValue = {
    projects: state.projects,
    sprints: state.sprints,
    columns: state.columns,
    backlogItems: state.backlogItems,
    createProject: (project: Omit<Project, "id" | "createdAt">) => {
      const newProject: Project = {
        ...project,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_PROJECT", payload: newProject });
    },
    updateProject: (project: Project) => {
      dispatch({ type: "UPDATE_PROJECT", payload: project });
    },
    deleteProject: (id: string) => {
      dispatch({ type: "REMOVE_PROJECT", payload: id });
    },
    createSprint: (sprint: Omit<Sprint, "id" | "isCompleted">) => {
      const newSprint: Sprint = {
        ...sprint,
        id: uuidv4(),
        isCompleted: false,
      };
      dispatch({ type: "ADD_SPRINT", payload: newSprint });
    },
    updateSprint: (sprint: Sprint) => {
      dispatch({ type: "UPDATE_SPRINT", payload: sprint });
    },
    deleteSprint: (id: string) => {
      dispatch({ type: "REMOVE_SPRINT", payload: id });
    },
    completeSprint: (id: string) => {
      dispatch({ type: "MARK_SPRINT_AS_COMPLETE", payload: id });
    },
    createTask: (task: Omit<Task, "id" | "createdAt">) => {
      const newTask: Task = {
        ...task,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_TASK", payload: newTask });
    },
    updateTask: (task: Task) => {
      dispatch({ type: "UPDATE_TASK", payload: task });
    },
    deleteTask: (id: string, columnId: string) => {
      dispatch({ type: "REMOVE_TASK", payload: { id, columnId } });
    },
    moveTask: (taskId: string, sourceColumnId: string, targetColumnId: string) => {
      dispatch({ type: "MOVE_TASK_TO_COLUMN", payload: { taskId, sourceColumnId, targetColumnId } });
    },
    createColumn: (title: string) => {
      const newColumn: Column = {
        id: uuidv4(),
        title,
        tasks: [],
      };
      dispatch({ type: "ADD_COLUMN", payload: newColumn });
    },
    deleteColumn: (id: string) => {
      dispatch({ type: "REMOVE_COLUMN", payload: id });
    },
    createBacklogItem: (backlogItem: Omit<BacklogItem, "id" | "createdAt">) => {
      const newBacklogItem: BacklogItem = {
        ...backlogItem,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_BACKLOG_ITEM", payload: newBacklogItem });
    },
    updateBacklogItem: (backlogItem: BacklogItem) => {
      dispatch({ type: "UPDATE_BACKLOG_ITEM", payload: backlogItem });
    },
    deleteBacklogItem: (id: string) => {
      dispatch({ type: "REMOVE_BACKLOG_ITEM", payload: id });
    },
    moveBacklogItemToSprint: (backlogItemId: string, sprintId: string) => {
      dispatch({ type: "MOVE_BACKLOG_ITEM_TO_SPRINT", payload: { backlogItemId, sprintId } });
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
