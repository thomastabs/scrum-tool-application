
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User2 } from "lucide-react";

interface TaskAssigneeProps {
  name: string | undefined;
}

const TaskAssignee: React.FC<TaskAssigneeProps> = ({ name }) => {
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!name) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Avatar className="h-6 w-6 mr-1">
          <AvatarFallback className="bg-muted text-[10px]">
            <User2 className="h-3 w-3" />
          </AvatarFallback>
        </Avatar>
        <span>Unassigned</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Avatar className="h-6 w-6 mr-1">
        <AvatarFallback className="bg-muted text-[10px]">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <span>{name}</span>
    </div>
  );
};

export default TaskAssignee;
