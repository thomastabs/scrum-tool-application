
import React from "react";
import { User } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface TaskAssigneeProps {
  name: string;
}

/**
 * TaskAssignee - Displays the assignee of a task with a user icon and name
 * 
 * @param {string} name - The name of the person assigned to the task
 * @returns A component showing the assignee's name with a user icon and tooltip
 */
const TaskAssignee: React.FC<TaskAssigneeProps> = ({ name }) => {
  // If no assignee, show 'Unassigned'
  const displayName = name.trim() || "Unassigned";
  
  // Style differently if task is unassigned
  const textStyle = name.trim() 
    ? "text-xs text-muted-foreground" 
    : "text-xs text-muted-foreground italic";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <User className="h-3 w-3" />
            <span className={textStyle}>{displayName}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Assigned to: {displayName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TaskAssignee;
