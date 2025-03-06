import { v4 as uuidv4 } from 'uuid';
import { BacklogItem } from '@/types';

// Action to create a new backlog item
export const createNewBacklogItem = (data) => {
  try {
    const backlogItem = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      priority: data.priority,
      storyPoints: data.storyPoints,
      projectId: data.projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return backlogItem;
  } catch (error) {
    console.error("Error creating backlog item:", error);
    throw error;
  }
};

// Action to update an existing backlog item
export const updateExistingBacklogItem = (id, data) => {
  try {
    const updatedBacklogItem = {
      id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      storyPoints: data.storyPoints,
      projectId: data.projectId,
      updatedAt: new Date(),
    };

    return updatedBacklogItem;
  } catch (error) {
    console.error("Error updating backlog item:", error);
    throw error;
  }
};

export const moveBacklogItemToTask = (backlogItem, sprintId, columnId, projectId) => {
  try {
    // Create a new task from the backlog item
    const task = {
      id: uuidv4(),
      title: backlogItem.title,
      description: backlogItem.description,
      priority: backlogItem.priority || 'medium',
      assignee: backlogItem.assignee || '',
      storyPoints: backlogItem.storyPoints || 0,
      columnId,
      sprintId,
      projectId, // Add projectId
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return task;
  } catch (error) {
    console.error("Error moving backlog item to task:", error);
    throw error;
  }
};
