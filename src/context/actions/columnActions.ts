
import { v4 as uuidv4 } from "uuid";
import { Column } from "@/types";
import { Toast } from "@/components/ui/use-toast";

export const createColumn = (
  columns: Column[],
  sprintId: string,
  title: string,
  toast: (props: { title: string; description: string; variant?: "default" | "destructive" }) => void
): Column[] => {
  // Check if the column already exists with the same title
  const existingColumn = columns.find(col => 
    col.title === title && 
    col.tasks.some(task => task.sprintId === sprintId)
  );

  if (existingColumn) {
    toast({
      title: "Column already exists",
      description: `A column named "${title}" already exists for this sprint.`,
      variant: "destructive"
    });
    return columns;
  }

  const newColumn: Column = {
    id: uuidv4(),
    title,
    tasks: []
  };
  
  toast({
    title: "Column created",
    description: `${title} column has been created successfully.`
  });

  return [...columns, newColumn];
};

export const deleteColumn = (
  columns: Column[],
  id: string,
  toast: ({ title, description }: Toast) => void
): Column[] => {
  const columnToDelete = columns.find(column => column.id === id);
  
  if (!columnToDelete) return columns;
  
  const updatedColumns = columns.filter(column => column.id !== id);
  
  toast({
    title: "Column deleted",
    description: `${columnToDelete.title} column has been deleted successfully.`
  });

  return updatedColumns;
};
