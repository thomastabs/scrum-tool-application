import { v4 as uuidv4 } from "uuid";
import { Task, TaskFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";

// Task actions
export const createTask = (sprintId: string, columnId: string, taskData: TaskFormData) => {
  const newTask: Task = {
    ...taskData,
    id: uuidv4(),
    columnId,
    sprintId,
    status: taskData.status || "todo",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  toast({
    title: "Task created",
    description: `${taskData.title} has been created successfully.`
  });
  
  return newTask;
};

export const updateTask = (id: string, taskData: TaskFormData, columns: any) => {
  // Find the task from all columns
  let task: Task | undefined;
  let columnId: string | undefined;

  for (const column of columns) {
    const foundTask = column.tasks.find((t: any) => t.id === id);
    if (foundTask) {
      task = foundTask;
      columnId = column.id;
      break;
    }
  }

  if (!task || !columnId) return null;

  const updatedTask: Task = {
    ...task,
    ...taskData,
    updatedAt: new Date(),
  };
  
  toast({
    title: "Task updated",
    description: `${taskData.title} has been updated successfully.`
  });
  
  return updatedTask;
};
