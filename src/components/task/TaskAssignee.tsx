
import React from "react";
import { User } from "lucide-react";

interface TaskAssigneeProps {
  name: string;
}

const TaskAssignee: React.FC<TaskAssigneeProps> = ({ name }) => {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <User className="h-3 w-3" />
      <span>{name}</span>
    </div>
  );
};

export default TaskAssignee;
