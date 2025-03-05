
import { BacklogItem, Task, Column, BacklogItemFormData } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

// Create a new backlog item
export const createBacklogItem = (
  items: BacklogItem[],
  data: BacklogItemFormData & { projectId: string },
  toastFn: any
): BacklogItem[] => {
  const newItem: BacklogItem = {
    id: uuidv4(),
    projectId: data.projectId,
    title: data.title,
    description: data.description,
    priority: data.priority,
    storyPoints: data.storyPoints,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  toastFn({
    title: "Backlog item created",
    description: `${data.title} has been added to the backlog.`,
  });

  return [...items, newItem];
};

// Update a backlog item
export const updateBacklogItem = (
  items: BacklogItem[],
  id: string,
  data: BacklogItemFormData,
  toastFn: any
): BacklogItem[] => {
  const updatedItems = items.map(item =>
    item.id === id
      ? {
          ...item,
          title: data.title,
          description: data.description,
          priority: data.priority,
          storyPoints: data.storyPoints,
          updatedAt: new Date()
        }
      : item
  );

  toastFn({
    title: "Backlog item updated",
    description: `${data.title} has been updated successfully.`,
  });

  return updatedItems;
};

// Delete a backlog item
export const deleteBacklogItem = (
  items: BacklogItem[],
  id: string,
  toastFn: any
): BacklogItem[] => {
  const itemToDelete = items.find(item => item.id === id);
  const updatedItems = items.filter(item => item.id !== id);

  if (itemToDelete) {
    toastFn({
      title: "Backlog item deleted",
      description: `${itemToDelete.title} has been deleted from the backlog.`,
    });
  }

  return updatedItems;
};

// Move backlog item to sprint
export const moveToSprint = (
  backlogItems: BacklogItem[],
  columns: Column[],
  backlogItemId: string,
  sprintId: string,
  toastFn: any
): { updatedItems: BacklogItem[], task: Task } => {
  // Find the backlog item
  const itemToMove = backlogItems.find(item => item.id === backlogItemId);
  if (!itemToMove) {
    throw new Error("Backlog item not found");
  }

  // Find the TO DO column
  const todoColumn = columns.find(col => col.title === "TO DO");
  if (!todoColumn) {
    throw new Error("TO DO column not found");
  }

  // Create a new task from the backlog item
  const newTask: Task = {
    id: uuidv4(),
    title: itemToMove.title,
    description: itemToMove.description,
    priority: itemToMove.priority,
    assignee: "",
    storyPoints: itemToMove.storyPoints,
    columnId: todoColumn.id,
    sprintId: sprintId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Remove the item from backlog
  const updatedItems = backlogItems.filter(item => item.id !== backlogItemId);

  toastFn({
    title: "Item moved to sprint",
    description: `${itemToMove.title} has been moved to the selected sprint.`,
  });

  return { updatedItems, task: newTask };
};
