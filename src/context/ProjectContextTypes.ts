
import { Project, Sprint, Column, BacklogItem } from "@/types";

export interface ProjectContextType {
  projects: Project[];
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
  createProject: (projectData: { title: string; description: string; endGoal: string }) => void;
  updateProject: (id: string, projectData: { title: string; description: string; endGoal: string }) => void;
  deleteProject: (id: string) => void;
  createSprint: (sprintData: { title: string; description: string; startDate: Date; endDate: Date; projectId: string }) => void;
  updateSprint: (id: string, sprintData: { title: string; description: string; startDate: Date; endDate: Date }) => void;
  deleteSprint: (id: string) => void;
  completeSprint: (id: string) => void;
  createColumn: (sprintId: string, title: string) => void;
  deleteColumn: (id: string) => void;
  createTask: (sprintId: string, columnId: string, taskData: { title: string; description: string; priority: "low" | "medium" | "high"; assignee: string; storyPoints: number }) => void;
  updateTask: (id: string, taskData: { title: string; description: string; priority: "low" | "medium" | "high"; assignee: string; storyPoints: number }) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string) => void;
  createBacklogItem: (itemData: { title: string; description: string; priority: "low" | "medium" | "high"; storyPoints: number; projectId: string }) => void;
  updateBacklogItem: (id: string, itemData: { title: string; description: string; priority: "low" | "medium" | "high"; storyPoints: number }) => void;
  deleteBacklogItem: (id: string) => void;
  moveBacklogItemToSprint: (itemId: string, sprintId: string) => void;
  moveToSprint: (itemId: string, sprintId: string) => void;
}
