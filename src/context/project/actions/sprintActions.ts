
import { Sprint } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const createSprint = (
  sprints: Sprint[],
  sprintData: { title: string; description: string; startDate: Date; endDate: Date; projectId: string },
  toast: any
) => {
  const newSprint: Sprint = {
    id: uuidv4(),
    projectId: sprintData.projectId,
    title: sprintData.title,
    description: sprintData.description,
    startDate: sprintData.startDate,
    endDate: sprintData.endDate,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  toast({
    title: "Sprint created",
    description: `${sprintData.title} has been created.`,
  });

  return newSprint;
};

export const updateSprint = (
  sprints: Sprint[],
  id: string,
  sprintData: { title: string; description: string; startDate: Date; endDate: Date },
  toast: any
) => {
  const updatedSprints = sprints.map((sprint) =>
    sprint.id === id
      ? {
          ...sprint,
          title: sprintData.title,
          description: sprintData.description,
          startDate: sprintData.startDate,
          endDate: sprintData.endDate,
          updatedAt: new Date(),
        }
      : sprint
  );

  toast({
    title: "Sprint updated",
    description: `${sprintData.title} has been updated.`,
  });

  return updatedSprints;
};

export const deleteSprint = (
  sprints: Sprint[],
  columns: any[],
  id: string,
  toast: any
) => {
  const sprintToDelete = sprints.find((sprint) => sprint.id === id);
  const updatedSprints = sprints.filter((sprint) => sprint.id !== id);
  
  // Update columns to remove tasks from the deleted sprint
  const updatedColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task: any) => task.sprintId !== id),
  }));

  if (sprintToDelete) {
    toast({
      title: "Sprint deleted",
      description: `${sprintToDelete.title} has been deleted.`,
    });
  }

  return { updatedSprints, updatedColumns };
};

export const completeSprint = (
  sprints: Sprint[],
  id: string,
  toast: any
) => {
  const updatedSprints = sprints.map((sprint) =>
    sprint.id === id
      ? {
          ...sprint,
          isCompleted: true,
          updatedAt: new Date(),
        }
      : sprint
  );

  const completedSprint = updatedSprints.find((sprint) => sprint.id === id);

  if (completedSprint) {
    toast({
      title: "Sprint completed",
      description: `${completedSprint.title} has been marked as completed.`,
    });
  }

  return updatedSprints;
};
