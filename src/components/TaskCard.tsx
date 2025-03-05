
import React from "react";
import { Task } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TaskPriorityBadge from "./task/TaskPriorityBadge";
import TaskAssignee from "./task/TaskAssignee";
import TaskActions from "./task/TaskActions";
import StoryPointsBadge from "./task/StoryPointsBadge";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
      taskId: task.id,
      sourceColumnId: task.columnId,
    }));
  };

  return (
    <Card
      className="mb-3 animate-fade-in border shadow-sm hover:shadow-md transition-all duration-200"
      draggable
      onDragStart={handleDragStart}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start">
          <TaskPriorityBadge priority={task.priority} />
          <StoryPointsBadge points={task.storyPoints} />
        </div>
        <CardTitle className="text-base mt-2">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <TaskAssignee name={task.assignee} />
        <TaskActions task={task} onEdit={onEdit} />
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
