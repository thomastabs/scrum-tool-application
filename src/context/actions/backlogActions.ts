
import { BacklogItem, Column, Task } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Move a backlog item to a sprint
export const moveToSprint = (
  backlogItems: BacklogItem[],
  columns: Column[],
  backlogItemId: string,
  sprintId: string,
  toast: any
): { updatedBacklogItems: BacklogItem[], updatedColumns: Column[] } => {
  // Find the backlog item
  const backlogItem = backlogItems.find(item => item.id === backlogItemId);
  if (!backlogItem) {
    toast({
      title: "Error",
      description: "Backlog item not found",
      variant: "destructive"
    });
    return { updatedBacklogItems: backlogItems, updatedColumns: columns };
  }

  // Find the TO DO column
  const todoColumn = columns.find(col => col.title === "TO DO");
  if (!todoColumn) {
    toast({
      title: "Error",
      description: "TO DO column not found. Please create default columns first.",
      variant: "destructive"
    });
    return { updatedBacklogItems: backlogItems, updatedColumns: columns };
  }

  // Create a new task from the backlog item
  const newTask: Task = {
    id: uuidv4(),
    title: backlogItem.title,
    description: backlogItem.description,
    priority: backlogItem.priority,
    assignee: "",
    storyPoints: backlogItem.storyPoints,
    columnId: todoColumn.id,
    sprintId: sprintId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Add the task to the TO DO column
  const updatedColumns = columns.map(col => {
    if (col.id === todoColumn.id) {
      return {
        ...col,
        tasks: [...col.tasks, newTask]
      };
    }
    return col;
  });

  // Remove the item from backlog
  const updatedBacklogItems = backlogItems.filter(item => item.id !== backlogItemId);

  toast({
    title: "Item moved to sprint",
    description: `${backlogItem.title} has been moved to the selected sprint.`,
  });

  return { updatedBacklogItems, updatedColumns };
};
