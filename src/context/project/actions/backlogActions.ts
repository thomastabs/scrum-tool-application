
import { BacklogItem, Column } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const createBacklogItem = (
  backlogItems: BacklogItem[],
  itemData: { title: string; description: string; priority: "low" | "medium" | "high"; storyPoints: number; projectId: string },
  toast: any
) => {
  const newItem: BacklogItem = {
    id: uuidv4(),
    projectId: itemData.projectId,
    title: itemData.title,
    description: itemData.description,
    priority: itemData.priority,
    storyPoints: itemData.storyPoints,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedBacklogItems = [...backlogItems, newItem];

  toast({
    title: "Backlog item created",
    description: `${itemData.title} has been added to the backlog.`,
  });

  return updatedBacklogItems;
};

export const updateBacklogItem = (
  backlogItems: BacklogItem[],
  id: string,
  itemData: { title: string; description: string; priority: "low" | "medium" | "high"; storyPoints: number },
  toast: any
) => {
  const updatedBacklogItems = backlogItems.map((item) =>
    item.id === id
      ? {
          ...item,
          title: itemData.title,
          description: itemData.description,
          priority: itemData.priority,
          storyPoints: itemData.storyPoints,
          updatedAt: new Date(),
        }
      : item
  );

  toast({
    title: "Backlog item updated",
    description: `${itemData.title} has been updated.`,
  });

  return updatedBacklogItems;
};

export const deleteBacklogItem = (
  backlogItems: BacklogItem[],
  id: string,
  toast: any
) => {
  const itemToDelete = backlogItems.find((item) => item.id === id);
  const updatedBacklogItems = backlogItems.filter((item) => item.id !== id);

  if (itemToDelete) {
    toast({
      title: "Backlog item deleted",
      description: `${itemToDelete.title} has been removed from the backlog.`,
    });
  }

  return updatedBacklogItems;
};

export const moveToSprint = (
  backlogItems: BacklogItem[],
  columns: Column[],
  itemId: string,
  sprintId: string,
  toast: any
) => {
  // Find the backlog item to move
  const itemToMove = backlogItems.find((item) => item.id === id);
  if (!itemToMove) return { updatedBacklogItems: backlogItems, updatedColumns: columns };

  // Remove the item from backlog
  const updatedBacklogItems = backlogItems.filter((item) => item.id !== itemId);

  // Find the first column (assumed to be 'To Do' or similar)
  const todoColumn = columns[0];
  if (!todoColumn) return { updatedBacklogItems, updatedColumns: columns };

  // Create a task from the backlog item
  const newTask = {
    id: uuidv4(),
    title: itemToMove.title,
    description: itemToMove.description,
    priority: itemToMove.priority,
    assignee: "",
    storyPoints: itemToMove.storyPoints,
    columnId: todoColumn.id,
    sprintId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Add the task to the first column
  const updatedColumns = columns.map((column) => {
    if (column.id === todoColumn.id) {
      return {
        ...column,
        tasks: [...column.tasks, newTask],
      };
    }
    return column;
  });

  toast({
    title: "Item moved to sprint",
    description: `${itemToMove.title} has been moved to the sprint.`,
  });

  return { updatedBacklogItems, updatedColumns };
};
