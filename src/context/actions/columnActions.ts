import { v4 as uuidv4 } from "uuid";
import { store } from "@/store";
import { addColumn } from "@/store/slices/columnSlice";
import { toast } from "@/components/ui/use-toast";

export const createColumn = (title: string) => {
  try {
    // Check if column already exists
    const columnExists = store.getState().columns.some(col => col.title === title);
    
    if (columnExists) {
      toast({
        title: "Column already exists",
        description: `A column named "${title}" already exists.`,
        variant: "destructive"
      });
      return;
    }
    
    const newColumn = {
      id: uuidv4(),
      title,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    store.dispatch(addColumn(newColumn));
    
    toast({
      title: "Column created",
      description: `${title} column has been created successfully.`,
    });
  } catch (error) {
    console.error("Error creating column:", error);
    toast({
      title: "Error",
      description: "Failed to create column. Please try again.",
      variant: "destructive"
    });
  }
};
