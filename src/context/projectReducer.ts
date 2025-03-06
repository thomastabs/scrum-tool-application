import { ProjectState, Project, Sprint, Column, BacklogItem, Task } from "@/types";

export const initialState: ProjectState = {
  projects: [],
  sprints: [],
  columns: [],
  backlogItems: [],
  selectedProject: null,
};

type ProjectAction =
  | { type: "SELECT_PROJECT"; payload: string }
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Project }
  | { type: "REMOVE_PROJECT"; payload: string }
  | { type: "ADD_SPRINT"; payload: Sprint }
  | { type: "UPDATE_SPRINT"; payload: Sprint }
  | { type: "REMOVE_SPRINT"; payload: string }
  | { type: "MARK_SPRINT_AS_COMPLETE"; payload: string }
  | { type: "ADD_COLUMN"; payload: Column }
  | { type: "REMOVE_COLUMN"; payload: string }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "REMOVE_TASK"; payload: { id: string; columnId: string } }
  | { type: "MOVE_TASK_TO_COLUMN"; payload: { taskId: string; sourceColumnId: string; targetColumnId: string } }
  | { type: "ADD_BACKLOG_ITEM"; payload: BacklogItem }
  | { type: "UPDATE_BACKLOG_ITEM"; payload: BacklogItem }
  | { type: "REMOVE_BACKLOG_ITEM"; payload: string }
  | { type: "MOVE_BACKLOG_ITEM_TO_SPRINT"; payload: { backlogItemId: string; sprintId: string } };

export const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  switch (action.type) {
    case "SET_PROJECTS":
      return {
        ...state,
        projects: action.payload,
      };
    
    case "SELECT_PROJECT":
      return {
        ...state,
        selectedProject: state.projects.find((p) => p.id === action.payload) || null,
      };
    
    case "ADD_PROJECT":
      return {
        ...state,
        projects: [...state.projects, action.payload],
      };
    
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id ? action.payload : project
        ),
        selectedProject:
          state.selectedProject?.id === action.payload.id ? action.payload : state.selectedProject,
      };
    
    case "REMOVE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== action.payload),
        selectedProject:
          state.selectedProject?.id === action.payload ? null : state.selectedProject,
      };
    
    case "ADD_SPRINT":
      return {
        ...state,
        sprints: [...state.sprints, action.payload],
      };
    
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
    
    case "ADD_COLUMN":
      return {
        ...state,
        columns: [...state.columns, action.payload],
      };
    
    case "REMOVE_COLUMN":
      return {
        ...state,
        columns: state.columns.filter((column) => column.id !== action.payload),
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
      return {
        ...state,
        columns: state.columns.map((column) => {
          if (column.id === action.payload.sourceColumnId) {
            return {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== action.payload.taskId),
            };
          } else if (column.id === action.payload.targetColumnId) {
            const taskToMove = state.columns
              .find((col) => col.id === action.payload.sourceColumnId)
              ?.tasks.find((task) => task.id === action.payload.taskId);
            return {
              ...column,
              tasks: taskToMove ? [...column.tasks, taskToMove] : column.tasks,
            };
          } else {
            return column;
          }
        }),
      };
    
    case "ADD_BACKLOG_ITEM":
      return {
        ...state,
        backlogItems: [...state.backlogItems, action.payload],
      };
    
    case "UPDATE_BACKLOG_ITEM":
      return {
        ...state,
        backlogItems: state.backlogItems.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case "REMOVE_BACKLOG_ITEM":
      return {
        ...state,
        backlogItems: state.backlogItems.filter((item) => item.id !== action.payload),
      };
    
    case "MOVE_BACKLOG_ITEM_TO_SPRINT":
      return {
        ...state,
        backlogItems: state.backlogItems.filter((item) => item.id !== action.payload.backlogItemId),
      };
    
    default:
      return state;
  }
};
