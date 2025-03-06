import React, { useState } from "react";
import { useParams } from "react-router-dom";
import TaskCard from "@/components/TaskCard"; // Fixed import path
import TaskForm from "./TaskForm";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Task } from "@/types";
import SprintColumn from "./sprint/SprintColumn";
import AddColumn from "./sprint/AddColumn";

interface SprintBoardProps {
  sprintId: string;
}

const SprintBoard: React.FC<SprintBoardProps> = ({ sprintId }) => {
  const { columns, createTask } = useProject();
  const { projectId } = useParams<{ projectId: string }>();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  const sprintColumns = columns.filter(
    (column) => column.tasks.find((task) => task.sprintId === sprintId)
  );

  const handleCreateTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setShowTaskForm(true);
  };

  const closeTaskForm = () => {
    setShowTaskForm(false);
    setSelectedColumnId(null);
  };

  return (
    <div className="flex flex-grow overflow-x-auto">
      {sprintColumns.map((column) => (
        <SprintColumn key={column.id} column={column} sprintId={sprintId} />
      ))}
      <AddColumn />

      {showTaskForm && selectedColumnId && (
        <TaskForm
          columnId={selectedColumnId}
          sprintId={sprintId}
          onClose={closeTaskForm}
        />
      )}
    </div>
  );
};

export default SprintBoard;
