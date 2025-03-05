
import { Project, Sprint, Column, BacklogItem, ProjectFormData, SprintFormData, TaskFormData, BacklogItemFormData } from "@/types";

export interface ProjectContextType {
  projects: Project[];
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
  createProject: (projectData: ProjectFormData) => void;
  updateProject: (id: string, projectData: ProjectFormData) => void;
  deleteProject: (id: string) => void;
  createSprint: (sprintData: SprintFormData & { projectId: string }) => void;
  updateSprint: (id: string, sprintData: SprintFormData) => void;
  deleteSprint: (id: string) => void;
  completeSprint: (id: string) => void;
  createColumn: (sprintId: string, title: string) => Promise<void>;
  deleteColumn: (id: string) => void;
  createTask: (sprintId: string, columnId: string, taskData: TaskFormData) => Promise<void>;
  updateTask: (id: string, taskData: TaskFormData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string) => void;
  createBacklogItem: (itemData: BacklogItemFormData & { projectId: string }) => void;
  updateBacklogItem: (id: string, itemData: BacklogItemFormData) => void;
  deleteBacklogItem: (id: string) => void;
  moveToSprint: (itemId: string, sprintId: string) => void;
  moveBacklogItemToSprint: (itemId: string, sprintId: string) => void;
}
