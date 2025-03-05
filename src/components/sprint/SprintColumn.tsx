
import React from "react";
import { Column, Task } from "@/types";
import TaskCard from "../TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface SprintColumnProps {
  column: Column;
  sprintId: string;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteColumn: (columnId: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
  isDefaultColumn: boolean;
}

const SprintColumn: React.FC<SprintColumnProps> = ({
  column,
  sprintId,
  onAddTask,
  onEditTask,
  onDeleteColumn,
  handleDragOver,
  handleDrop,
  isDefaultColumn
}) => {
  return (
    <div
      key={column.id}
      className="board-column border rounded-lg p-4 bg-background"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, column.id)}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">{column.title}</h3>
        <div className="flex gap-1">
          {!isDefaultColumn && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onDeleteColumn(column.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onAddTask(column.id)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="space-y-2 min-h-[200px]">
        {column.tasks
          .filter(task => task.sprintId === sprintId)
          .map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
            />
          ))}
      </div>
    </div>
  );
};

export default SprintColumn;
