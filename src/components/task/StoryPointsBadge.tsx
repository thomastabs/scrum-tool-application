
import React from "react";
import { Badge } from "@/components/ui/badge";

interface StoryPointsBadgeProps {
  points: number;
}

/**
 * StoryPointsBadge - Displays story points with color-coding based on point value
 * 
 * @param {number} points - The number of story points for the task
 * @returns A badge component displaying the story points with appropriate styling
 */
const StoryPointsBadge: React.FC<StoryPointsBadgeProps> = ({ points }) => {
  // Function to determine badge color based on points value
  const getPointsClass = () => {
    // Higher point values get more prominent styling
    if (points >= 8) {
      return "bg-red-100 text-red-800 border-red-200"; // Large tasks (8+)
    } else if (points >= 5) {
      return "bg-orange-100 text-orange-800 border-orange-200"; // Medium-large tasks (5-7)
    } else if (points >= 3) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200"; // Medium tasks (3-4)
    } else {
      return "bg-green-100 text-green-800 border-green-200"; // Small tasks (1-2)
    }
  };

  return (
    <Badge variant="outline" className={getPointsClass()}>
      SP: {points}
    </Badge>
  );
};

export default StoryPointsBadge;
