
import { v4 as uuidv4 } from "uuid";
import { Column, Task } from "@/types";
import { Toast } from "@/types/toast";

export const createTask = (
  columns: Column[],
  sprintId: string,
  columnId: string,
  taskData: { title: string; description: string; priority: "low" | "medium" | "high"; assignee: string; storyPoints: number },
  toast: (props: Toast) => void
): Column[] => {
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
  
  const updatedColumns = columns.map(column => 
    column.id === columnId
      ? { 
          ...column, 
          tasks: [...column.tasks, newTask]
        }
      : column
  );
  
  toast({
    title: "Task created",
    description: `${taskData.title} has been created successfully.`
  });

  return updatedColumns;
};

export const updateTask = (
  columns: Column[],
  id: string,
  taskData: { title: string; description: string; priority: "low" | "medium" | "high"; assignee: string; storyPoints: number },
  toast: (props: Toast) => void
): Column[] => {
  const updatedColumns = columns.map(column => ({
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
  }));
  
  toast({
    title: "Task updated",
    description: `${taskData.title} has been updated successfully.`
  });

  return updatedColumns;
};

export const deleteTask = (
  columns: Column[],
  id: string,
  toast: (props: Toast) => void
): Column[] => {
  let taskTitle = "";
  
  const updatedColumns = columns.map(column => {
    const taskToDelete = column.tasks.find(task => task.id === id);
    if (taskToDelete) {
      taskTitle = taskToDelete.title;
    }
    
    return {
      ...column,
      tasks: column.tasks.filter(task => task.id !== id)
    };
  });
  
  if (taskTitle) {
    toast({
      title: "Task deleted",
      description: `${taskTitle} has been deleted successfully.`
    });
  }

  return updatedColumns;
};

export const moveTask = (
  columns: Column[],
  taskId: string,
  sourceColumnId: string,
  destinationColumnId: string
): Column[] => {
  // Don't do anything if source and destination are the same
  if (sourceColumnId === destinationColumnId) return columns;
  
  const sourceColumn = columns.find(column => column.id === sourceColumnId);
  if (!sourceColumn) return columns;
  
  const taskToMove = sourceColumn.tasks.find(task => task.id === taskId);
  if (!taskToMove) return columns;
  
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
        tasks: [...column.tasks, { ...taskToMove, columnId: destinationColumnId, updatedAt: new Date() }]
      };
    }
    
    return column;
  });
  
  return updatedColumns;
};
