
import React from "react";
import { Link } from "react-router-dom";
import { Sprint } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PencilIcon } from "lucide-react";

interface SprintCardProps {
  sprint: Sprint;
  projectId: string;
  onEdit: (sprint: Sprint) => void;
}

const SprintCard: React.FC<SprintCardProps> = ({ sprint, projectId, onEdit }) => {
  return (
    <Card
      key={sprint.id}
      className={`hover:shadow-md transition-shadow ${
        sprint.isCompleted ? "bg-secondary/30" : "bg-background"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-xl">
            {sprint.title}
          </CardTitle>
          {sprint.isCompleted && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Completed
            </span>
          )}
        </div>
        <CardDescription>
          {new Date(sprint.startDate).toLocaleDateString()} -{" "}
          {new Date(sprint.endDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-2">
          {sprint.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(sprint)}
        >
          <PencilIcon className="h-3 w-3 mr-1" /> Edit
        </Button>
        <Button
          size="sm"
          asChild
        >
          <Link to={`/my-projects/${projectId}/sprint/${sprint.id}`}>
            View Board
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SprintCard;
