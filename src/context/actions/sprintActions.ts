import { v4 as uuidv4 } from "uuid";
import { Sprint, SprintFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";

// Sprint actions
export const createSprint = (sprintData: SprintFormData) => {
  const newSprint: Sprint = {
    ...sprintData,
    id: uuidv4(),
    isCompleted: false,
    projectId: sprintData.projectId || "",
    justification: sprintData.justification || "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  toast({
    title: "Sprint created",
    description: `${sprintData.title} has been created successfully.`
  });
  
  return newSprint;
};

export const updateSprint = (id: string, sprintData: SprintFormData, sprints: Sprint[]) => {
  const sprint = sprints.find(s => s.id === id);
  if (!sprint) return null;

  const updatedSprint: Sprint = {
    ...sprint,
    ...sprintData,
    updatedAt: new Date(),
  };
  
  toast({
    title: "Sprint updated",
    description: `${sprintData.title} has been updated successfully.`
  });
  
  return updatedSprint;
};
