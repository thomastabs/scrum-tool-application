
import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, AlertOctagon } from "lucide-react";

interface TaskPriorityBadgeProps {
  priority: "low" | "medium" | "high";
}

/**
 * TaskPriorityBadge - Displays a badge indicating task priority with appropriate colors and icons
 * 
 * @param {string} priority - The priority level: "low", "medium", or "high"
 * @returns A badge component with color and icon that visually represents the priority level
 */
const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ priority }) => {
  // Get the appropriate styling based on the priority level
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

  // Get the appropriate icon for the priority level
  const getPriorityIcon = () => {
    switch (priority) {
      case "high":
        return <AlertOctagon className="h-3 w-3 mr-1" />;
      case "medium":
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      case "low":
        return <AlertCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Badge variant="outline" className={`flex items-center ${getPriorityClass()}`}>
      {getPriorityIcon()}
      {priority}
    </Badge>
  );
};

export default TaskPriorityBadge;
