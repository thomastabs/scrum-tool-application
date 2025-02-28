
import { v4 as uuidv4 } from "uuid";
import { Sprint } from "@/types";
import { Toast } from "@/types/toast";

export const createSprint = (
  sprints: Sprint[],
  sprintData: { title: string; description: string; startDate: Date; endDate: Date; projectId: string },
  toast: (props: Toast) => void
): Sprint => {
  const newSprint: Sprint = {
    id: uuidv4(),
    title: sprintData.title,
    description: sprintData.description,
    startDate: sprintData.startDate,
    endDate: sprintData.endDate,
    projectId: sprintData.projectId,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  toast({
    title: "Sprint created",
    description: `${sprintData.title} has been created successfully.`
  });
  
  return newSprint;
};

export const updateSprint = (
  sprints: Sprint[],
  id: string,
  sprintData: { title: string; description: string; startDate: Date; endDate: Date },
  toast: (props: Toast) => void
): Sprint[] => {
  const updatedSprints = sprints.map(sprint => 
    sprint.id === id
      ? { 
          ...sprint, 
          ...sprintData,
          updatedAt: new Date()
        }
      : sprint
  );
  
  toast({
    title: "Sprint updated",
    description: `${sprintData.title} has been updated successfully.`
  });

  return updatedSprints;
};

export const deleteSprint = (
  sprints: Sprint[],
  columns: any[],
  id: string,
  toast: (props: Toast) => void
): { updatedSprints: Sprint[], updatedColumns: any[] } => {
  const sprintToDelete = sprints.find(sprint => sprint.id === id);
  
  if (!sprintToDelete) {
    return { updatedSprints: sprints, updatedColumns: columns };
  }
  
  // Update columns to remove tasks for this sprint
  const updatedColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => task.sprintId !== id)
  }));
  
  // Delete the sprint itself
  const updatedSprints = sprints.filter(sprint => sprint.id !== id);
  
  toast({
    title: "Sprint deleted",
    description: `${sprintToDelete.title} has been deleted successfully.`
  });

  return { updatedSprints, updatedColumns };
};

export const completeSprint = (
  sprints: Sprint[],
  id: string,
  toast: (props: Toast) => void
): Sprint[] => {
  const updatedSprints = sprints.map(sprint => 
    sprint.id === id
      ? { 
          ...sprint, 
          isCompleted: true,
          updatedAt: new Date()
        }
      : sprint
  );
  
  toast({
    title: "Sprint completed",
    description: "The sprint has been marked as completed."
  });

  return updatedSprints;
};
