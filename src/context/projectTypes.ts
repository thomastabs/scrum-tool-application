
import { 
  Project, 
  Sprint, 
  Column, 
  Task, 
  BacklogItem,
  ProjectFormData,
  SprintFormData,
  TaskFormData,
  BacklogItemFormData
} from "@/types";

export type Action =
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

export type State = {
  projects: Project[];
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
  selectedProject: Project | null;
};
