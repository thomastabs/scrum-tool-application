
import { State, Action } from "./projectTypes";
import { Task } from "@/types";

export const initialState: State = {
  projects: [],
  sprints: [],
  columns: [],
  backlogItems: [],
  selectedProject: null,
};

export const projectReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_PROJECTS":
      return {
        ...state,
        projects: action.payload,
      };
      
    case "LOAD_STATE":
      return action.payload;

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
      };

    case "REMOVE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== action.payload),
        selectedProject: state.selectedProject?.id === action.payload ? null : state.selectedProject,
      };

    case "CLEAR_ALL_PROJECTS":
      return {
        ...state,
        projects: [],
        sprints: [],
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
          sprint.id === action.payload
            ? { ...sprint, isCompleted: true }
            : sprint
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
            ? {
                ...column,
                tasks: column.tasks.filter(
                  (task) => task.id !== action.payload.id
                ),
              }
            : column
        ),
      };

    case "MOVE_TASK_TO_COLUMN": {
      const { taskId, sourceColumnId, targetColumnId, timestamp = new Date() } = action.payload;

      // Find the task to move
      const sourceColumn = state.columns.find(
        (column) => column.id === sourceColumnId
      );
      const taskToMove = sourceColumn?.tasks.find((task) => task.id === taskId);

      if (!sourceColumn || !taskToMove) return state;

      return {
        ...state,
        columns: state.columns.map((column) => {
          // Remove task from source column
          if (column.id === sourceColumnId) {
            return {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== taskId),
            };
          }
          // Add task to target column with updated timestamp
          if (column.id === targetColumnId) {
            return {
              ...column,
              tasks: [...column.tasks, { 
                ...taskToMove, 
                columnId: targetColumnId,
                updatedAt: timestamp
              }],
            };
          }
          return column;
        }),
      };
    }

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
        backlogItems: state.backlogItems.filter(
          (item) => item.id !== action.payload
        ),
      };

    case "MOVE_BACKLOG_ITEM_TO_SPRINT": {
      const { backlogItemId, sprintId } = action.payload;
      const backlogItem = state.backlogItems.find(
        (item) => item.id === backlogItemId
      );

      if (!backlogItem) return state;

      // Create a task from backlog item, ensuring optional fields are properly handled
      const newTask: Task = {
        id: backlogItemId,
        title: backlogItem.title,
        description: backlogItem.description,
        priority: backlogItem.priority || "medium",
        storyPoints: backlogItem.storyPoints || 1,
        sprintId,
        columnId: state.columns[0]?.id || "", // Add to first column
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        ...state,
        // Remove item from backlog
        backlogItems: state.backlogItems.filter(
          (item) => item.id !== backlogItemId
        ),
        // Add task to first column
        columns: state.columns.map((column, index) =>
          index === 0
            ? { ...column, tasks: [...column.tasks, newTask] }
            : column
        ),
      };
    }

    default:
      return state;
  }
};
