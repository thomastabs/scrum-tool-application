
import React from "react";
import { Badge } from "@/components/ui/badge";

interface TaskPriorityBadgeProps {
  priority: "low" | "medium" | "high";
}

const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ priority }) => {
  const getPriorityClass = () => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Badge variant="outline" className={getPriorityClass()}>
      {priority}
    </Badge>
  );
};

export default TaskPriorityBadge;
