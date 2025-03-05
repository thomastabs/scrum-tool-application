
import { Sprint, Column } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Import supabase functionality
// import {
//   createSprintInDB,
//   getSprintsFromDB,
//   updateSprintInDB,
//   completeSprintInDB,
//   deleteSprintFromDB
// } from "@/lib/supabase";

// Create a new sprint
export const createSprintLocal = (
  sprints: Sprint[],
  data: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    projectId: string;
  },
  toastFn: any
): Sprint => {
  const newSprint: Sprint = {
    id: uuidv4(),
    projectId: data.projectId,
    title: data.title,
    description: data.description,
    startDate: data.startDate,
    endDate: data.endDate,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return newSprint;
};

// Update a sprint
export const updateSprintLocal = (
  sprints: Sprint[],
  id: string,
  data: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
  }
): Sprint[] => {
  return sprints.map(sprint =>
    sprint.id === id
      ? {
          ...sprint,
          title: data.title,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          updatedAt: new Date()
        }
      : sprint
  );
};

// Mark a sprint as completed
export const completeSprintLocal = (
  sprints: Sprint[],
  id: string
): Sprint[] => {
  return sprints.map(sprint =>
    sprint.id === id
      ? {
          ...sprint,
          isCompleted: true,
          updatedAt: new Date()
        }
      : sprint
  );
};

// Delete a sprint and related tasks
export const deleteSprintLocal = (
  sprints: Sprint[],
  columns: Column[],
  id: string
): { updatedSprints: Sprint[], updatedColumns: Column[] } => {
  // Remove the sprint
  const updatedSprints = sprints.filter(sprint => sprint.id !== id);
  
  // Remove tasks related to this sprint from all columns
  const updatedColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => task.sprintId !== id)
  }));
  
  return { updatedSprints, updatedColumns };
};
