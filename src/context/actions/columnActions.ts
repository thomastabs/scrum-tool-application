
import { Column } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Create a new column
export const createColumn = (
  columns: Column[],
  title: string,
  toast: any
): Column[] => {
  // Check if column with same title exists
  const columnExists = columns.some(col => col.title === title);
  if (columnExists) {
    toast({
      title: "Column already exists",
      description: `A column named "${title}" already exists.`,
      variant: "destructive"
    });
    return columns;
  }

  // Create new column
  const newColumn: Column = {
    id: uuidv4(),
    title,
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  toast({
    title: "Column created",
    description: `${title} column has been created successfully.`,
  });

  return [...columns, newColumn];
};

// Delete a column
export const deleteColumn = (
  columns: Column[],
  id: string,
  toast: any
): Column[] => {
  const columnToDelete = columns.find(col => col.id === id);
  if (!columnToDelete) return columns;

  // Check if column has tasks
  if (columnToDelete.tasks.length > 0) {
    toast({
      title: "Cannot delete column",
      description: "This column still has tasks. Move or delete them first.",
      variant: "destructive"
    });
    return columns;
  }

  // Check if column is a default column
  if (["TO DO", "IN PROGRESS", "DONE"].includes(columnToDelete.title)) {
    toast({
      title: "Cannot delete default column",
      description: "The default columns (TO DO, IN PROGRESS, DONE) cannot be deleted.",
      variant: "destructive"
    });
    return columns;
  }

  // Delete the column
  const updatedColumns = columns.filter(col => col.id !== id);

  toast({
    title: "Column deleted",
    description: `${columnToDelete.title} column has been deleted successfully.`,
  });

  return updatedColumns;
};
