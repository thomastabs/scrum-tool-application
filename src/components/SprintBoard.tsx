
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
  const { columns, createTask, createColumn, deleteColumn, moveTask } = useProject();
  const { projectId } = useParams<{ projectId: string }>();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const sprintColumns = columns.filter(
    (column) => column.tasks.find((task) => task.sprintId === sprintId)
  );

  const handleCreateTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setShowTaskForm(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    
    if (data) {
      try {
        const { taskId, sourceColumnId } = JSON.parse(data);
        moveTask(taskId, sourceColumnId, columnId);
      } catch (error) {
        console.error("Error parsing drag data:", error);
      }
    }
  };

  const handleAddColumn = (name: string) => {
    createColumn(name, sprintId);
  };

  const closeTaskForm = () => {
    setShowTaskForm(false);
    setSelectedColumnId(null);
    setTaskToEdit(null);
  };

  return (
    <div className="flex flex-grow overflow-x-auto">
      {sprintColumns.map((column) => (
        <SprintColumn 
          key={column.id} 
          column={column} 
          sprintId={sprintId}
          onAddTask={handleCreateTask}
          onEditTask={handleEditTask}
          onDeleteColumn={deleteColumn}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          isDefaultColumn={
            column.title === "TO DO" || 
            column.title === "IN PROGRESS" || 
            column.title === "DONE"
          }
        />
      ))}
      <AddColumn onAddColumn={handleAddColumn} sprintId={sprintId} />

      {showTaskForm && selectedColumnId && (
        <TaskForm
          columnId={selectedColumnId}
          sprintId={sprintId}
          onClose={closeTaskForm}
          taskToEdit={taskToEdit}
        />
      )}
    </div>
  );
};

export default SprintBoard;
