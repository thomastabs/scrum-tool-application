
import { v4 as uuidv4 } from "uuid";
import { 
  Project, 
  ProjectFormData, 
  Sprint, 
  SprintFormData, 
  Task, 
  TaskFormData, 
  BacklogItem, 
  BacklogItemFormData, 
  Column 
} from "@/types";
import { toast } from "@/components/ui/use-toast";

// Project actions
export const createProject = (projectData: ProjectFormData) => {
  const newProject: Project = {
    ...projectData,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  toast({
    title: "Project created",
    description: `${projectData.title} has been created successfully.`
  });
  
  return newProject;
};

export const updateProject = (id: string, projectData: ProjectFormData, projects: Project[]) => {
  const project = projects.find(p => p.id === id);
  if (!project) return null;

  const updatedProject: Project = {
    ...project,
    ...projectData,
    updatedAt: new Date(),
  };
  
  toast({
    title: "Project updated",
    description: `${projectData.title} has been updated successfully.`
  });
  
  return updatedProject;
};

// Sprint actions
export const createSprint = (sprintData: SprintFormData) => {
  const newSprint: Sprint = {
    ...sprintData,
    id: uuidv4(),
    isCompleted: false,
    projectId: sprintData.projectId || "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  toast({
    title: "Sprint created",
    description: `${sprintData.title} has been created successfully.`
  });
  
  return newSprint;
};

export const updateSprint = (id: string, sprintData: SprintFormData, sprints: Sprint[]) => {
  const sprint = sprints.find(s => s.id === id);
  if (!sprint) return null;

  const updatedSprint: Sprint = {
    ...sprint,
    ...sprintData,
    updatedAt: new Date(),
  };
  
  toast({
    title: "Sprint updated",
    description: `${sprintData.title} has been updated successfully.`
  });
  
  return updatedSprint;
};

// Task actions
export const createTask = (sprintId: string, columnId: string, taskData: TaskFormData) => {
  const newTask: Task = {
    ...taskData,
    id: uuidv4(),
    columnId,
    sprintId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  toast({
    title: "Task created",
    description: `${taskData.title} has been created successfully.`
  });
  
  return newTask;
};

export const updateTask = (id: string, taskData: TaskFormData, columns: Column[]) => {
  // Find the task from all columns
  let task: Task | undefined;
  let columnId: string | undefined;

  for (const column of columns) {
    const foundTask = column.tasks.find(t => t.id === id);
    if (foundTask) {
      task = foundTask;
      columnId = column.id;
      break;
    }
  }

  if (!task || !columnId) return null;

  const updatedTask: Task = {
    ...task,
    ...taskData,
    updatedAt: new Date(),
  };
  
  toast({
    title: "Task updated",
    description: `${taskData.title} has been updated successfully.`
  });
  
  return updatedTask;
};

// Column actions
export const createColumn = (title: string) => {
  const newColumn: Column = {
    id: uuidv4(),
    title,
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  toast({
    title: "Column created",
    description: `${title} column has been created successfully.`
  });
  
  return newColumn;
};

// Backlog actions
export const createBacklogItem = (backlogItemData: BacklogItemFormData) => {
  const newBacklogItem: BacklogItem = {
    ...backlogItemData,
    id: uuidv4(),
    projectId: backlogItemData.projectId || "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  toast({
    title: "Backlog item created",
    description: `${backlogItemData.title} has been created successfully.`
  });
  
  return newBacklogItem;
};

export const updateBacklogItem = (id: string, backlogItemData: BacklogItemFormData, backlogItems: BacklogItem[]) => {
  const backlogItem = backlogItems.find(item => item.id === id);
  if (!backlogItem) return null;

  const updatedBacklogItem: BacklogItem = {
    ...backlogItem,
    ...backlogItemData,
    updatedAt: new Date(),
  };
  
  toast({
    title: "Backlog item updated",
    description: `${backlogItemData.title} has been updated successfully.`
  });
  
  return updatedBacklogItem;
};
