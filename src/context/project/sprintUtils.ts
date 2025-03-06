import { v4 as uuidv4 } from "uuid";
import { Sprint, SprintFormData } from "@/types";

/**
 * Creates a new Sprint object from the provided form data
 */
export const createSprintFromFormData = (formData: SprintFormData): Sprint => {
  return {
    id: uuidv4(),
    projectId: formData.projectId || "",
    title: formData.title,
    description: formData.description,
    startDate: formData.startDate,
    endDate: formData.endDate,
    isCompleted: false,
    justification: formData.justification || "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
