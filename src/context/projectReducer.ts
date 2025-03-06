
import { State, Action } from "./projectTypes";

export const initialState: State = {
  projects: [],
  sprints: [],
  columns: [
    {
      id: crypto.randomUUID(),
      title: "TO DO",
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: crypto.randomUUID(),
      title: "IN PROGRESS",
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: crypto.randomUUID(),
      title: "DONE",
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
  ],
  backlogItems: [],
  selectedProject: null,
};

export const projectReducer = (state: State, action: Action): State => {
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
        // We're just removing the backlog item since there's no explicit tracking of
        // backlog items in sprints in the current data model
      };
    default:
      return state;
  }
};
