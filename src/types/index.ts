
export interface ProjectFormData {
  title: string;
  description?: string;
  endGoal?: string;
}

export interface Project extends ProjectFormData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SprintFormData {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  projectId?: string;
}

export interface Sprint extends Omit<SprintFormData, 'startDate' | 'endDate'> {
  id: string;
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  storyPoints?: number;
  assignee?: string;
}

export interface Task extends TaskFormData {
  id: string;
  sprintId: string;
  columnId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  order_index: number;
  sprint_id: string;
  created_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BacklogItemFormData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  storyPoints?: number;
  projectId?: string;
}

export interface BacklogItem extends BacklogItemFormData {
  id: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Collaborator {
  id: string;
  projectId: string;
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
}

export interface CollaboratorFormData {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface ProjectContextType {
  projects: Project[];
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
  selectedProject: Project | null;
  
  selectProject: (id: string) => void;
  createProject: (projectData: ProjectFormData) => void;
  updateProject: (id: string, projectData: ProjectFormData) => void;
  deleteProject: (id: string) => void;
  deleteAllProjects: () => void;
  
  createSprint: (sprintData: SprintFormData) => void;
  updateSprint: (id: string, sprintData: SprintFormData) => void;
  deleteSprint: (id: string) => void;
  completeSprint: (id: string) => void;
  
  createTask: (sprintId: string, columnId: string, taskData: TaskFormData) => void;
  updateTask: (id: string, taskData: TaskFormData) => void;
  deleteTask: (id: string, columnId: string) => void;
  moveTask: (taskId: string, sourceColumnId: string, targetColumnId: string) => void;
  
  createColumn: (title: string, sprintId: string) => void;
  deleteColumn: (id: string) => void;
  
  createBacklogItem: (backlogItemData: BacklogItemFormData) => void;
  updateBacklogItem: (id: string, backlogItemData: BacklogItemFormData) => void;
  deleteBacklogItem: (id: string) => void;
  moveBacklogItemToSprint: (backlogItemId: string, sprintId: string) => void;
}
