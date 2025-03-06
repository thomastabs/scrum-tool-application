import { State, Action } from "./projectTypes";

export const initialState: State = {
  projects: [],
  sprints: [],
  columns: [],
  backlogItems: [],
  selectedProject: null,
};

export const projectReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "LOAD_PROJECTS":
      return {
        ...state,
        projects: action.payload,
      };
      
    case "LOAD_SPRINTS":
      return {
        ...state,
        sprints: action.payload,
      };
      
    case "ADD_PROJECT":
      return {
        ...state,
        projects: [action.payload, ...state.projects],
      };
      
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id ? action.payload : project
        ),
        selectedProject:
          state.selectedProject?.id === action.payload.id
            ? action.payload
            : state.selectedProject,
      };
      
    case "REMOVE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== action.payload),
        sprints: state.sprints.filter((sprint) => sprint.projectId !== action.payload),
        selectedProject:
          state.selectedProject?.id === action.payload
            ? null
            : state.selectedProject,
      };
      
    case "CLEAR_ALL_PROJECTS":
      return {
        ...state,
        projects: [],
        sprints: [],
        backlogItems: [],
        selectedProject: null,
      };
      
    case "SELECT_PROJECT":
      return {
        ...state,
        selectedProject: state.projects.find((project) => project.id === action.payload) || null,
      };

    case "ADD_SPRINT":
      return {
        ...state,
        sprints: [action.payload, ...state.sprints],
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
      
    case "ADD_TASK":
      return {
        ...state,
        columns: state.columns.map((column) =>
          column.id === action.payload.columnId
            ? { ...column, tasks: [action.payload, ...column.tasks] }
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
      
      const taskToMove = state.columns
        .find((column) => column.id === sourceColumnId)?.tasks
        .find((task) => task.id === taskId);
      
      if (!taskToMove) {
        return state;
      }
      
      return {
        ...state,
        columns: state.columns.map((column) => {
          if (column.id === sourceColumnId) {
            return {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== taskId),
            };
          } else if (column.id === targetColumnId) {
            return {
              ...column,
              tasks: [taskToMove, ...column.tasks],
            };
          } else {
            return column;
          }
        }),
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
      
    case "ADD_BACKLOG_ITEM":
      return {
        ...state,
        backlogItems: [action.payload, ...state.backlogItems],
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
      const { backlogItemId, sprintId } = action.payload;
      
      // Find the backlog item
      const backlogItemToMove = state.backlogItems.find(item => item.id === backlogItemId);
      
      if (!backlogItemToMove) {
        return state;
      }
      
      // Remove the backlog item from the backlog
      const updatedBacklogItems = state.backlogItems.filter(item => item.id !== backlogItemId);
      
      // Here you would typically add the backlog item as a task to the sprint
      // Since we don't have tasks directly in sprints, this part might need adjustment
      
      return {
        ...state,
        backlogItems: updatedBacklogItems,
        // You might also want to update the sprint with the new task
        // sprints: updatedSprints,
      };
    
    default:
      return state;
  }
};
