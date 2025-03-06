
export interface Project {
  id: string;
  title: string;
  description: string;
  endGoal: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
  projectId: string;
  justification: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  assignee?: string;
  sprintId: string;
  columnId: string;
  storyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  projectId: string;
  storyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFormData {
  title: string;
  description: string;
  endGoal: string;
}

export interface SprintFormData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  projectId?: string;
  justification: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  assignee?: string;
  storyPoints: number;
}

export interface BacklogItemFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  projectId?: string;
  storyPoints: number;
}

export interface ProjectContextType {
  projects: Project[];
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
  selectedProject: Project | null;
  loading?: boolean;
  setProjects: (projects: Project[]) => void;
  
  selectProject: (id: string) => void;
  createProject: (projectData: ProjectFormData) => void;
  updateProject: (id: string, projectData: ProjectFormData) => void;
  deleteProject: (id: string) => void;
  
  createSprint: (sprintData: SprintFormData) => void;
  updateSprint: (id: string, sprintData: SprintFormData) => void;
  deleteSprint: (id: string) => void;
  completeSprint: (id: string) => void;
  
  createTask: (sprintId: string, columnId: string, taskData: TaskFormData) => void;
  updateTask: (id: string, taskData: TaskFormData) => void;
  deleteTask: (id: string, columnId: string) => void;
  moveTask: (taskId: string, sourceColumnId: string, targetColumnId: string) => void;
  
  createColumn: (title: string) => void;
  deleteColumn: (id: string) => void;
  
  createBacklogItem: (backlogItemData: BacklogItemFormData) => void;
  updateBacklogItem: (id: string, backlogItemData: BacklogItemFormData) => void;
  deleteBacklogItem: (id: string) => void;
  moveBacklogItemToSprint: (backlogItemId: string, sprintId: string) => void;
}

// Add missing types for collaborator functionality
export interface Collaborator {
  id: string;
  email: string;
  role: "viewer" | "editor" | "admin";
  projectId: string;
  createdAt: Date;
}

export interface CollaboratorFormData {
  email: string;
  role: "viewer" | "editor" | "admin";
}
