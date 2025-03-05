import { v4 as uuidv4 } from "uuid";
import { store } from "@/store";
import { addTask } from "@/store/slices/taskSlice";
import { removeBacklogItem } from "@/store/slices/backlogSlice";
import { toast } from "@/components/ui/use-toast";

export const moveBacklogItemToSprint = async (backlogItemId: string, sprintId: string) => {
  try {
    // Find the backlog item
    const backlogItem = store.getState().backlogItems.find(item => item.id === backlogItemId);
    if (!backlogItem) return;
    
    // Find the TO DO column
    const todoColumn = store.getState().columns.find(col => col.title === "TO DO");
    if (!todoColumn) {
      toast({
        title: "Error",
        description: "TO DO column not found. Please create a sprint first.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a task from the backlog item
    const task = {
      id: uuidv4(),
      title: backlogItem.title,
      description: backlogItem.description,
      priority: backlogItem.priority,
      assignee: "",
      storyPoints: backlogItem.storyPoints,
      columnId: todoColumn.id,
      sprintId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add the task to the column
    store.dispatch(addTask(task));
    
    // Delete the backlog item
    store.dispatch(removeBacklogItem(backlogItemId));
    
    toast({
      title: "Item moved to sprint",
      description: `${backlogItem.title} has been moved to the selected sprint.`,
    });
  } catch (error) {
    console.error("Error moving backlog item to sprint:", error);
    toast({
      title: "Error",
      description: "Failed to move item to sprint. Please try again.",
      variant: "destructive"
    });
  }
};
