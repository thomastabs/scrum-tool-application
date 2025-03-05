
import { Column, Task } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const createTask = (
  columns: Column[],
  sprintId: string,
  columnId: string,
  taskData: { title: string; description: string; priority: "low" | "medium" | "high"; assignee: string; storyPoints: number },
  toast: any
) => {
  const newTask: Task = {
    id: uuidv4(),
    title: taskData.title,
    description: taskData.description,
    priority: taskData.priority,
    assignee: taskData.assignee,
    storyPoints: taskData.storyPoints,
    columnId,
    sprintId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedColumns = columns.map((column) => {
    if (column.id === columnId) {
      return {
        ...column,
        tasks: [...column.tasks, newTask],
      };
    }
    return column;
  });

  toast({
    title: "Task created",
    description: `${taskData.title} has been created.`,
  });

  return updatedColumns;
};

export const updateTask = (
  columns: Column[],
  id: string,
  taskData: { title: string; description: string; priority: "low" | "medium" | "high"; assignee: string; storyPoints: number },
  toast: any
) => {
  const updatedColumns = columns.map((column) => {
    const taskIndex = column.tasks.findIndex((task) => task.id === id);
    if (taskIndex !== -1) {
      const updatedTasks = [...column.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        assignee: taskData.assignee,
        storyPoints: taskData.storyPoints,
        updatedAt: new Date(),
      };
      return {
        ...column,
        tasks: updatedTasks,
      };
    }
    return column;
  });

  toast({
    title: "Task updated",
    description: `${taskData.title} has been updated.`,
  });

  return updatedColumns;
};

export const deleteTask = (
  columns: Column[],
  id: string,
  toast: any
) => {
  let taskTitle = "";
  const updatedColumns = columns.map((column) => {
    const taskToDelete = column.tasks.find((task) => task.id === id);
    if (taskToDelete) {
      taskTitle = taskToDelete.title;
    }
    return {
      ...column,
      tasks: column.tasks.filter((task) => task.id !== id),
    };
  });

  if (taskTitle) {
    toast({
      title: "Task deleted",
      description: `${taskTitle} has been deleted.`,
    });
  }

  return updatedColumns;
};

export const moveTask = (
  columns: Column[],
  taskId: string,
  sourceColumnId: string,
  destinationColumnId: string
) => {
  // Find the task to move
  const sourceColumn = columns.find((column) => column.id === sourceColumnId);
  if (!sourceColumn) return columns;

  const taskToMove = sourceColumn.tasks.find((task) => task.id === taskId);
  if (!taskToMove) return columns;

  // Create updated columns with the task moved to the destination column
  const updatedColumns = columns.map((column) => {
    if (column.id === sourceColumnId) {
      return {
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      };
    }
    if (column.id === destinationColumnId) {
      return {
        ...column,
        tasks: [...column.tasks, { ...taskToMove, columnId: destinationColumnId, updatedAt: new Date() }],
      };
    }
    return column;
  });

  return updatedColumns;
};
