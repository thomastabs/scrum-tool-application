import React, { createContext, useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
import { Project, Sprint, Column, Task, BacklogItem } from "@/types";

interface ProjectContextType {
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
  createBacklogItem: (itemData: { title: string; description: string; priority: "low" | "medium" | "high"; storyPoints: number }) => void;
  updateBacklogItem: (id: string, itemData: { title: string; description: string; priority: "low" | "medium" | "high"; storyPoints: number }) => void;
  deleteBacklogItem: (id: string) => void;
  moveToSprint: (itemId: string, sprintId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedProjects = localStorage.getItem("projects");
    const storedSprints = localStorage.getItem("sprints");
    const storedColumns = localStorage.getItem("columns");
    const storedBacklogItems = localStorage.getItem("backlogItems");

    if (storedProjects) setProjects(JSON.parse(storedProjects));
    if (storedSprints) setSprints(JSON.parse(storedSprints));
    if (storedColumns) setColumns(JSON.parse(storedColumns));
    if (storedBacklogItems) setBacklogItems(JSON.parse(storedBacklogItems));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("sprints", JSON.stringify(sprints));
  }, [sprints]);

  useEffect(() => {
    localStorage.setItem("columns", JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem("backlogItems", JSON.stringify(backlogItems));
  }, [backlogItems]);

  const createProject = (projectData: { title: string; description: string; endGoal: string }) => {
    const newProject: Project = {
      id: uuidv4(),
      title: projectData.title,
      description: projectData.description,
      endGoal: projectData.endGoal,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setProjects([...projects, newProject]);
    
    toast({
      title: "Project created",
      description: `${projectData.title} has been created successfully.`
    });
  };

  const updateProject = (id: string, projectData: { title: string; description: string; endGoal: string }) => {
    setProjects(
      projects.map(project => 
        project.id === id
          ? { 
              ...project, 
              ...projectData,
              updatedAt: new Date()
            }
          : project
      )
    );
    
    toast({
      title: "Project updated",
      description: `${projectData.title} has been updated successfully.`
    });
  };

  const deleteProject = (id: string) => {
    const projectToDelete = projects.find(project => project.id === id);
    
    if (!projectToDelete) return;
    
    // Delete all sprints for this project
    setSprints(sprints.filter(sprint => sprint.projectId !== id));
    
    // Delete all columns and their tasks associated with this project's sprints
    const projectSprintIds = sprints
      .filter(sprint => sprint.projectId === id)
      .map(sprint => sprint.id);
    
    // Filter out columns that have tasks associated with this project's sprints
    setColumns(
      columns.filter(column => 
        !column.tasks.some(task => 
          projectSprintIds.includes(task.sprintId)
        )
      )
    );
    
    // Delete the project itself
    setProjects(projects.filter(project => project.id !== id));
    
    toast({
      title: "Project deleted",
      description: `${projectToDelete.title} has been deleted successfully.`
    });
  };

  const createSprint = (sprintData: { title: string; description: string; startDate: Date; endDate: Date; projectId: string }) => {
    const newSprint: Sprint = {
      id: uuidv4(),
      title: sprintData.title,
      description: sprintData.description,
      startDate: sprintData.startDate,
      endDate: sprintData.endDate,
      projectId: sprintData.projectId,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // No longer create default columns here - they will be handled by the SprintBoard component
    
    setSprints([...sprints, newSprint]);
    
    toast({
      title: "Sprint created",
      description: `${sprintData.title} has been created successfully.`
    });
    
    return newSprint;
  };

  const updateSprint = (id: string, sprintData: { title: string; description: string; startDate: Date; endDate: Date }) => {
    setSprints(
      sprints.map(sprint => 
        sprint.id === id
          ? { 
              ...sprint, 
              ...sprintData,
              updatedAt: new Date()
            }
          : sprint
      )
    );
    
    toast({
      title: "Sprint updated",
      description: `${sprintData.title} has been updated successfully.`
    });
  };

  const deleteSprint = (id: string) => {
    const sprintToDelete = sprints.find(sprint => sprint.id === id);
    
    if (!sprintToDelete) return;
    
    // Delete all tasks associated with this sprint
    setColumns(
      columns.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => task.sprintId !== id)
      }))
    );
    
    // Delete the sprint itself
    setSprints(sprints.filter(sprint => sprint.id !== id));
    
    toast({
      title: "Sprint deleted",
      description: `${sprintToDelete.title} has been deleted successfully.`
    });
  };

  const completeSprint = (id: string) => {
    setSprints(
      sprints.map(sprint => 
        sprint.id === id
          ? { 
              ...sprint, 
              isCompleted: true,
              updatedAt: new Date()
            }
          : sprint
      )
    );
    
    toast({
      title: "Sprint completed",
      description: "The sprint has been marked as completed."
    });
  };

  const createColumn = (sprintId: string, title: string) => {
    // Check if the column already exists with the same title
    const existingColumn = columns.find(col => 
      col.title === title && 
      col.tasks.some(task => task.sprintId === sprintId)
    );

    if (existingColumn) {
      toast({
        title: "Column already exists",
        description: `A column named "${title}" already exists for this sprint.`,
        variant: "destructive"
      });
      return;
    }

    const newColumn: Column = {
      id: uuidv4(),
      title,
      tasks: []
    };
    
    setColumns([...columns, newColumn]);
    
    toast({
      title: "Column created",
      description: `${title} column has been created successfully.`
    });
  };

  const deleteColumn = (id: string) => {
    const columnToDelete = columns.find(column => column.id === id);
    
    if (!columnToDelete) return;
    
    setColumns(columns.filter(column => column.id !== id));
    
    toast({
      title: "Column deleted",
      description: `${columnToDelete.title} column has been deleted successfully.`
    });
  };

  const createTask = (sprintId: string, columnId: string, taskData: { title: string; description: string; priority: "low" | "medium" | "high"; assignee: string; storyPoints: number }) => {
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      assignee: taskData.assignee,
      storyPoints: taskData.storyPoints,
      sprintId,
      columnId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setColumns(
      columns.map(column => 
        column.id === columnId
          ? { 
              ...column, 
              tasks: [...column.tasks, newTask]
            }
          : column
      )
    );
    
    toast({
      title: "Task created",
      description: `${taskData.title} has been created successfully.`
    });
  };

  const updateTask = (id: string, taskData: { title: string; description: string; priority: "low" | "medium" | "high"; assignee: string; storyPoints: number }) => {
    setColumns(
      columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task => 
          task.id === id
            ? { 
                ...task, 
                ...taskData,
                updatedAt: new Date()
              }
            : task
        )
      }))
    );
    
    toast({
      title: "Task updated",
      description: `${taskData.title} has been updated successfully.`
    });
  };

  const deleteTask = (id: string) => {
    let taskTitle = "";
    
    setColumns(
      columns.map(column => {
        const taskToDelete = column.tasks.find(task => task.id === id);
        if (taskToDelete) {
          taskTitle = taskToDelete.title;
        }
        
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== id)
        };
      })
    );
    
    if (taskTitle) {
      toast({
        title: "Task deleted",
        description: `${taskTitle} has been deleted successfully.`
      });
    }
  };

  const moveTask = (taskId: string, sourceColumnId: string, destinationColumnId: string) => {
    // Don't do anything if source and destination are the same
    if (sourceColumnId === destinationColumnId) return;
    
    const sourceColumn = columns.find(column => column.id === sourceColumnId);
    if (!sourceColumn) return;
    
    const taskToMove = sourceColumn.tasks.find(task => task.id === taskId);
    if (!taskToMove) return;
    
    // Remove task from source column
    const updatedSourceColumn = {
      ...sourceColumn,
      tasks: sourceColumn.tasks.filter(task => task.id !== taskId)
    };
    
    // Add task to destination column
    const updatedColumns = columns.map(column => {
      if (column.id === sourceColumnId) {
        return updatedSourceColumn;
      }
      
      if (column.id === destinationColumnId) {
        return {
          ...column,
          tasks: [...column.tasks, { ...taskToMove, columnId: destinationColumnId }]
        };
      }
      
      return column;
    });
    
    setColumns(updatedColumns);
  };

  const createBacklogItem = (itemData: { title: string; description: string; priority: "low" | "medium" | "high"; storyPoints: number }) => {
    const newItem: BacklogItem = {
      id: uuidv4(),
      title: itemData.title,
      description: itemData.description,
      priority: itemData.priority,
      storyPoints: itemData.storyPoints,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setBacklogItems([...backlogItems, newItem]);
    
    toast({
      title: "Backlog item created",
      description: `${itemData.title} has been added to the backlog.`
    });
  };

  const updateBacklogItem = (id: string, itemData: { title: string; description: string; priority: "low" | "medium" | "high"; storyPoints: number }) => {
    setBacklogItems(
      backlogItems.map(item => 
        item.id === id
          ? { 
              ...item, 
              ...itemData,
              updatedAt: new Date()
            }
          : item
      )
    );
    
    toast({
      title: "Backlog item updated",
      description: `${itemData.title} has been updated successfully.`
    });
  };

  const deleteBacklogItem = (id: string) => {
    const itemToDelete = backlogItems.find(item => item.id === id);
    
    if (!itemToDelete) return;
    
    setBacklogItems(backlogItems.filter(item => item.id !== id));
    
    toast({
      title: "Backlog item deleted",
      description: `${itemToDelete.title} has been removed from the backlog.`
    });
  };

  const moveToSprint = (itemId: string, sprintId: string) => {
    const item = backlogItems.find(item => item.id === itemId);
    if (!item) return;
    
    // Find the TO DO column for this sprint
    const todoColumn = columns.find(column => 
      column.title === "TO DO" && 
      column.tasks.some(task => task.sprintId === sprintId)
    );
    
    if (!todoColumn) {
      toast({
        title: "Error",
        description: "Could not find the TO DO column for this sprint.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new task from the backlog item
    const newTask: Task = {
      id: uuidv4(),
      title: item.title,
      description: item.description,
      priority: item.priority,
      assignee: "",
      storyPoints: item.storyPoints,
      sprintId,
      columnId: todoColumn.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add the task to the TO DO column
    setColumns(
      columns.map(column => 
        column.id === todoColumn.id
          ? { 
              ...column, 
              tasks: [...column.tasks, newTask]
            }
          : column
      )
    );
    
    // Remove the item from the backlog
    setBacklogItems(backlogItems.filter(item => item.id !== itemId));
    
    toast({
      title: "Item moved to sprint",
      description: `${item.title} has been moved to the sprint.`
    });
  };

  const contextValue: ProjectContextType = {
    projects,
    sprints,
    columns,
    backlogItems,
    createProject,
    updateProject,
    deleteProject,
    createSprint,
    updateSprint,
    deleteSprint,
    completeSprint,
    createColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    createBacklogItem,
    updateBacklogItem,
    deleteBacklogItem,
    moveToSprint
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
