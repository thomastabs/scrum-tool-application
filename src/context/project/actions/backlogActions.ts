// Fix the reference to 'id' in this file
// This file has an undefined 'id' reference that needs to be fixed

import { v4 as uuidv4 } from "uuid";
import { BacklogItem, BacklogItemFormData, Task, Column } from "@/types";

interface MoveToSprintResult {
  updatedItems: BacklogItem[];
  task: Task;
}

/**
 * Adds a new backlog item.
 * @param items - The current array of backlog items.
 * @param itemData - The data for the new backlog item.
 * @returns The updated array of backlog items with the new item added.
 */
export const addBacklogItem = (items: BacklogItem[], itemData: BacklogItemFormData): BacklogItem[] => {
  const newItem: BacklogItem = {
    id: uuidv4(),
    ...itemData,
    createdAt: new Date(),
    updatedAt: new Date(),
    projectId: 'some-project-id' // This should be replaced with the actual project ID
  };
  return [...items, newItem];
};

/**
 * Updates an existing backlog item.
 * @param items - The current array of backlog items.
 * @param itemId - The ID of the item to update.
 * @param itemData - The new data for the backlog item.
 * @returns The updated array of backlog items with the specified item updated.
 */
export const updateBacklogItem = (items: BacklogItem[], itemId: string, itemData: BacklogItemFormData): BacklogItem[] => {
  return items.map(item =>
    item.id === itemId ? { ...item, ...itemData, updatedAt: new Date() } : item
  );
};

/**
 * Deletes a backlog item.
 * @param items - The current array of backlog items.
 * @param itemId - The ID of the item to delete.
 * @returns The updated array of backlog items with the specified item removed.
 */
export const deleteBacklogItem = (items: BacklogItem[], itemId: string): BacklogItem[] => {
  return items.filter(item => item.id !== itemId);
};

// Fix the reference to undefined 'id' variable
export const moveToSprint = (items: BacklogItem[], itemId: string, sprintId: string): { updatedItems: BacklogItem[], task: Task } => {
  // Find the item to move
  const itemIndex = items.findIndex(item => item.id === itemId);
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
    updatedAt: new Date()
  };
  
  // Remove the item from the backlog
  const updatedItems = [...items.slice(0, itemIndex), ...items.slice(itemIndex + 1)];
  
  return { updatedItems, task };
};
