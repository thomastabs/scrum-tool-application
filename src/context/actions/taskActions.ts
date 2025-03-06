import { v4 as uuidv4 } from 'uuid';
import { Task, TaskFormData, Column } from '@/types';

export const updateExistingTask = (task, data) => {
  try {
    task = {
      ...task,
      title: data.title,
      description: data.description,
      priority: data.priority,
      assignee: data.assignee,
      storyPoints: data.storyPoints,
      updatedAt: new Date(),
    };

    return task;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const createNewTask = (sprintId, columnId, data, projectId) => {
  try {
    const task = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      priority: data.priority,
      assignee: data.assignee,
      storyPoints: data.storyPoints,
      sprintId,
      columnId,
      projectId, // Add projectId
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};
