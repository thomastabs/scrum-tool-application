// Fix the column creation in this file to include createdAt and updatedAt properties
// Adding the necessary properties to fix TypeScript errors

import { v4 as uuidv4 } from "uuid";
import { BacklogItem, BacklogItemFormData, Task, Column } from "@/types";

export const createBacklogItem = (
  items: BacklogItem[],
  projectId: string,
  data: BacklogItemFormData
): BacklogItem[] => {
  const newItem: BacklogItem = {
    id: uuidv4(),
    projectId,
    title: data.title,
    description: data.description,
    priority: data.priority,
    storyPoints: data.storyPoints,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return [...items, newItem];
};

export const updateBacklogItem = (
  items: BacklogItem[],
  itemId: string,
  data: BacklogItemFormData
): BacklogItem[] => {
  return items.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        ...data,
        updatedAt: new Date(),
      };
    }
    return item;
  });
};

export const deleteBacklogItem = (
  items: BacklogItem[],
  itemId: string
): BacklogItem[] => {
  return items.filter((item) => item.id !== itemId);
};

export const moveToSprint = (
  items: BacklogItem[],
  itemId: string,
  sprintId: string
): { updatedItems: BacklogItem[]; task: Task } => {
  // Find the item to move
  const itemIndex = items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) throw new Error("Backlog item not found");

  const item = items[itemIndex];

  // Create a new task from the backlog item
  const task: Task = {
    id: uuidv4(),
    title: item.title,
    description: item.description,
    priority: item.priority,
    assignee: "",
    storyPoints: item.storyPoints,
    columnId: "", // This will be set by the caller
    sprintId: sprintId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Remove the item from the backlog
  const updatedItems = [
    ...items.slice(0, itemIndex),
    ...items.slice(itemIndex + 1),
  ];

  return { updatedItems, task };
};

// Fix the column creation to include createdAt and updatedAt
export const createColumn = (title: string): Column => {
  const now = new Date();
  return {
    id: uuidv4(),
    title,
    tasks: [],
    createdAt: now,
    updatedAt: now
  };
};
