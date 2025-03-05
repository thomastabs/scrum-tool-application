
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";
import { Column } from "@/types";

// Since we don't have access to the store, we'll create a simple implementation
// that can be used by the ProjectContext
export const createColumn = (title: string) => {
  try {
    // Create a new column with the correct type
    const newColumn: Column = {
      id: uuidv4(),
      title,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Return the new column instead of dispatching to a store
    return newColumn;
  } catch (error) {
    console.error("Error creating column:", error);
    toast({
      title: "Error",
      description: "Failed to create column. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};
