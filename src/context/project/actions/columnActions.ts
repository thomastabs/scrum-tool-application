
import { Column } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const createColumn = (
  columns: Column[],
  title: string,
  toast: any
) => {
  const newColumn: Column = {
    id: uuidv4(),
    title,
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  toast({
    title: "Column created",
    description: `${title} column has been created.`,
  });

  return [...columns, newColumn];
};

export const deleteColumn = (
  columns: Column[],
  id: string,
  toast: any
) => {
  const columnToDelete = columns.find((column) => column.id === id);
  const updatedColumns = columns.filter((column) => column.id !== id);

  if (columnToDelete) {
    toast({
      title: "Column deleted",
      description: `${columnToDelete.title} column has been deleted.`,
    });
  }

  return updatedColumns;
};
