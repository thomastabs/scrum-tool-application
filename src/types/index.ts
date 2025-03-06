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
  projectId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
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

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignee: string;
  storyPoints: number;
  columnId: string;
  sprintId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BacklogItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  storyPoints: number;
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
  justification?: string;
  projectId?: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignee: string;
  storyPoints: number;
}

export interface BacklogItemFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  storyPoints: number;
  projectId?: string;
}

// Add the missing Collaborator types
export interface Collaborator {
  id: string;
  projectId: string;
  email: string;
  role: "viewer" | "editor" | "admin";
  status: "pending" | "accepted";
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaboratorFormData {
  email: string;
  role: "viewer" | "editor" | "admin";
}

export interface ProjectContextType {
  projects: Project[];
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
  selectedProject: Project | null;
  selectProject: (id: string) => void;
  createProject: (project: ProjectFormData) => void;
  updateProject: (id: string, project: ProjectFormData) => void;
  deleteProject: (id: string) => void;
  createSprint: (sprint: SprintFormData) => void;
  updateSprint: (id: string, sprint: SprintFormData) => void;
  deleteSprint: (id: string) => void;
  completeSprint: (id: string) => void;
  createTask: (sprintId: string, columnId: string, task: TaskFormData) => void;
  updateTask: (id: string, task: TaskFormData) => void;
  deleteTask: (id: string, columnId: string) => void;
  moveTask: (taskId: string, sourceColumnId: string, targetColumnId: string) => void;
  createColumn: (title: string) => void;
  deleteColumn: (id: string) => void;
  createBacklogItem: (backlogItem: BacklogItemFormData) => void;
  updateBacklogItem: (id: string, backlogItem: BacklogItemFormData) => void;
  deleteBacklogItem: (id: string) => void;
  moveBacklogItemToSprint: (backlogItemId: string, sprintId: string) => void;
}
