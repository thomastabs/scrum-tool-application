
import React, { useState } from "react";
import { Sprint, Task } from "@/types";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import SprintHeader from "@/components/sprint/SprintHeader";
import SprintColumn from "@/components/sprint/SprintColumn";
import AddColumn from "@/components/sprint/AddColumn";
import TaskForm from "@/components/TaskForm";

interface SprintBoardProps {
  sprint: Sprint;
  onClose: () => void;
}

const SprintBoard: React.FC<SprintBoardProps> = ({ sprint, onClose }) => {
  const { columns, createColumn, deleteColumn, moveTask, completeSprint } = useProject();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  // Get columns that belong to this sprint
  const sprintColumns = columns.filter(column => column.sprint_id === sprint.id);

  // Check if all tasks are completed for a sprint
  const allTasksCompleted = () => {
    if (!sprint) return false;
    
    const doneColumn = sprintColumns.find(column => column.title === "DONE");
    if (!doneColumn) return false;
    
    // Count total tasks for this sprint
    const totalTasks = sprintColumns.reduce(
      (count, column) => count + column.tasks.filter(task => task.sprintId === sprint.id).length,
      0
    );
    
    // Count tasks in DONE column
    const doneTasks = doneColumn.tasks.filter(task => task.sprintId === sprint.id).length;
    
    // If there are no tasks, sprint can't be completed
    if (totalTasks === 0) return false;
    
    // Check if all tasks are in DONE column
    return doneTasks === totalTasks;
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setShowTaskForm(true);
  };

  const handleAddTask = (columnId: string) => {
    setActiveColumnId(columnId);
    setTaskToEdit(null);
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

  return (
    <div className="animate-fade-in">
      <Button
        variant="ghost"
        onClick={onClose}
        className="mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Project
      </Button>

      <SprintHeader 
        sprint={sprint} 
        canComplete={allTasksCompleted()} 
        onCompleteSprint={completeSprint} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {sprintColumns.map((column) => (
          <SprintColumn 
            key={column.id}
            column={column}
            sprintId={sprint.id}
            onAddTask={handleAddTask}
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

        <AddColumn onAddColumn={createColumn} sprintId={sprint.id} />
      </div>

      {showTaskForm && activeColumnId && (
        <TaskForm
          onClose={() => {
            setShowTaskForm(false);
            setTaskToEdit(null);
          }}
          sprintId={sprint.id}
          columnId={activeColumnId}
          taskToEdit={taskToEdit}
        />
      )}
    </div>
  );
};

export default SprintBoard;
