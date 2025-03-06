import { v4 as uuidv4 } from "uuid";
import { BacklogItem, BacklogItemFormData, Task } from "@/types";
import { toast } from "@/components/ui/use-toast";

// Backlog actions
export const createBacklogItem = (backlogItemData: BacklogItemFormData) => {
  const newBacklogItem: BacklogItem = {
    ...backlogItemData,
    id: uuidv4(),
    projectId: backlogItemData.projectId || "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  toast({
    title: "Backlog item created",
    description: `${backlogItemData.title} has been created successfully.`
  });
  
  return newBacklogItem;
};

export const convertBacklogItemToTask = (backlogItem: BacklogItem, sprintId: string, columnId: string): Task => {
  return {
    id: uuidv4(),
    title: backlogItem.title,
    description: backlogItem.description,
    priority: backlogItem.priority,
    assignee: "",
    storyPoints: backlogItem.storyPoints,
    columnId,
    sprintId,
    status: "todo",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const updateBacklogItem = (id: string, backlogItemData: BacklogItemFormData, backlogItems: BacklogItem[]) => {
  const backlogItem = backlogItems.find(item => item.id === id);
  if (!backlogItem) return null;

  const updatedBacklogItem: BacklogItem = {
    ...backlogItem,
    ...backlogItemData,
    updatedAt: new Date(),
  };
  
  toast({
    title: "Backlog item updated",
    description: `${backlogItemData.title} has been updated successfully.`
  });
  
  return updatedBacklogItem;
};
