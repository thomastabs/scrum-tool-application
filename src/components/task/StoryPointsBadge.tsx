
import React from "react";
import { Badge } from "@/components/ui/badge";

interface StoryPointsBadgeProps {
  points: number;
}

const StoryPointsBadge: React.FC<StoryPointsBadgeProps> = ({ points }) => {
  return (
    <Badge variant="secondary">
      SP: {points}
    </Badge>
  );
};

export default StoryPointsBadge;
