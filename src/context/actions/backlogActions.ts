
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";
import { BacklogItem, Task } from "@/types";

// Helper function to move a backlog item to a sprint
export const moveBacklogItemToSprint = (
  backlogItem: BacklogItem,
  sprintId: string,
  todoColumnId: string
): Task | null => {
  try {
    if (!backlogItem) {
      toast({
        title: "Error",
        description: "Backlog item not found.",
        variant: "destructive"
      });
      return null;
    }
    
    if (!todoColumnId) {
      toast({
        title: "Error",
        description: "TO DO column not found. Please create a sprint first.",
        variant: "destructive"
      });
      return null;
    }
    
    // Create a task from the backlog item
    const task: Task = {
      id: uuidv4(),
      title: backlogItem.title,
      description: backlogItem.description,
      priority: backlogItem.priority,
      assignee: "",
      storyPoints: backlogItem.storyPoints,
      columnId: todoColumnId,
      sprintId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    toast({
      title: "Item moved to sprint",
      description: `${backlogItem.title} has been moved to the selected sprint.`,
    });
    
    return task;
  } catch (error) {
    console.error("Error moving backlog item to sprint:", error);
    toast({
      title: "Error",
      description: "Failed to move item to sprint. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};
