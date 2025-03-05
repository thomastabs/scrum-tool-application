
import React from "react";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/types";
import { useProject } from "@/context/ProjectContext";

interface TaskActionsProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({ task, onEdit }) => {
  const { deleteTask } = useProject();
  
  return (
    <div className="flex gap-1">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7"
        onClick={() => onEdit(task)}
      >
        <PencilIcon className="h-3 w-3" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 text-destructive"
        onClick={() => deleteTask(task.id, task.columnId)}
      >
        <TrashIcon className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default TaskActions;
