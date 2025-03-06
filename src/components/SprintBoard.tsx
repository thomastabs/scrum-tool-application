<lov-codelov-code>
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import TaskCard from "@/components/TaskCard";
import TaskForm from "./TaskForm";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Task, BoardColumn } from "@/types"; // Updated import to use BoardColumn
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

  const columnsBySprintId = columns.filter(
    (column) => column.tasks.find((task) => task.sprintId === sprintId)
  );

  // Convert columns to BoardColumn format for compatibility
  const sprintColumns: BoardColumn[] = columnsBySprintId.map(col => ({
    id: col.id,
    title: col.title,
    order_index: col.order_index || 0,
    sprint_id: sprintId,
    tasks: col.tasks.filter(task => task.sprintId === sprintId),
    created_at: col.created_at || col.createdAt,
    isDefault: col.isDefault || ['TO DO', 'IN PROGRESS', 'DONE'].includes(col.title)
  }));

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
    createColumn(name);
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
            column.isDefault || ['TO DO', 'IN PROGRESS', 'DONE'].includes(column.title)
          }
        />
      ))}
      <AddColumn onAddColumn={handleAddColumn} />

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
</lov-code>
