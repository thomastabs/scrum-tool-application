
import { v4 as uuidv4 } from "uuid";
import { BacklogItem, Column } from "@/types";
import { Toast } from "@/components/ui/use-toast";

export const createBacklogItem = (
  backlogItems: BacklogItem[],
  itemData: { title: string; description: string; priority: "low" | "medium" | "high"; storyPoints: number; projectId: string },
  toast: ({ title, description }: Toast) => void
): BacklogItem[] => {
  const newItem: BacklogItem = {
    id: uuidv4(),
    title: itemData.title,
    description: itemData.description,
    priority: itemData.priority,
    storyPoints: itemData.storyPoints,
    projectId: itemData.projectId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  toast({
    title: "Backlog item created",
    description: `${itemData.title} has been added to the backlog.`
  });

  return [...backlogItems, newItem];
};

export const updateBacklogItem = (
  backlogItems: BacklogItem[],
  id: string,
  itemData: { title: string; description: string; priority: "low" | "medium" | "high"; storyPoints: number },
  toast: ({ title, description }: Toast) => void
): BacklogItem[] => {
  const updatedBacklogItems = backlogItems.map(item => 
    item.id === id
      ? { 
          ...item, 
          ...itemData,
          updatedAt: new Date()
        }
      : item
  );
  
  toast({
    title: "Backlog item updated",
    description: `${itemData.title} has been updated successfully.`
  });

  return updatedBacklogItems;
};

export const deleteBacklogItem = (
  backlogItems: BacklogItem[],
  id: string,
  toast: ({ title, description }: Toast) => void
): BacklogItem[] => {
  const itemToDelete = backlogItems.find(item => item.id === id);
  
  if (!itemToDelete) return backlogItems;
  
  const updatedBacklogItems = backlogItems.filter(item => item.id !== id);
  
  toast({
    title: "Backlog item deleted",
    description: `${itemToDelete.title} has been removed from the backlog.`
  });

  return updatedBacklogItems;
};

export const moveToSprint = (
  backlogItems: BacklogItem[],
  columns: Column[],
  itemId: string,
  sprintId: string,
  toast: ({ title, description, variant }: { title: string; description: string; variant?: "default" | "destructive" }) => void
): { updatedBacklogItems: BacklogItem[], updatedColumns: Column[] } => {
  const item = backlogItems.find(item => item.id === itemId);
  if (!item) {
    return { updatedBacklogItems: backlogItems, updatedColumns: columns };
  }
  
  // Find the TO DO column for this sprint
  const todoColumn = columns.find(column => 
    column.title === "TO DO" && 
    column.tasks.some(task => task.sprintId === sprintId)
  );
  
  if (!todoColumn) {
    toast({
      title: "Error",
      description: "Could not find the TO DO column for this sprint.",
      variant: "destructive"
    });
    return { updatedBacklogItems: backlogItems, updatedColumns: columns };
  }
  
  // Create a new task from the backlog item
  const newTask = {
    id: uuidv4(),
    title: item.title,
    description: item.description,
    priority: item.priority,
    assignee: "",
    storyPoints: item.storyPoints,
    sprintId,
    columnId: todoColumn.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Add the task to the TO DO column
  const updatedColumns = columns.map(column => 
    column.id === todoColumn.id
      ? { 
          ...column, 
          tasks: [...column.tasks, newTask]
        }
      : column
  );
  
  // Remove the item from the backlog
  const updatedBacklogItems = backlogItems.filter(item => item.id !== itemId);
  
  toast({
    title: "Item moved to sprint",
    description: `${item.title} has been moved to the sprint.`
  });

  return { updatedBacklogItems, updatedColumns };
};
