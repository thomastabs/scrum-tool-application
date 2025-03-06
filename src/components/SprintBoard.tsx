
import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Sprint, Task, Column } from "@/types";
import TaskForm from "./TaskForm";
import SprintHeader from "./sprint/SprintHeader";
import SprintColumn from "./sprint/SprintColumn";
import AddColumn from "./sprint/AddColumn";

interface SprintBoardProps {
  sprint: Sprint;
}

const SprintBoard: React.FC<SprintBoardProps> = ({ sprint }) => {
  const { columns, createColumn, deleteColumn, moveTask, completeSprint } = useProject();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  // Only get the ONE instance of each standard column that we need
  const todoColumn = columns.find(column => column.title === "TO DO");
  const inProgressColumn = columns.find(column => column.title === "IN PROGRESS");
  const doneColumn = columns.find(column => column.title === "DONE");

  // Get custom columns that have tasks for this sprint
  const customColumns = columns.filter(column => 
    column.title !== "TO DO" && 
    column.title !== "IN PROGRESS" && 
    column.title !== "DONE" &&
    column.tasks.some(task => task.sprintId === sprint.id)
  );

  // Combine all columns used by this sprint
  const sprintColumns = [
    todoColumn,
    inProgressColumn,
    doneColumn,
    ...customColumns
  ].filter(Boolean) as Column[];

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

  const handleAddColumn = (name: string) => {
    createColumn(name);
  };

  // Check if all tasks are completed
  const allTasksCompleted = () => {
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

  return (
    <div className="p-4">
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

        <AddColumn onAddColumn={handleAddColumn} />
      </div>

      {showTaskForm && activeColumnId && (
        <TaskForm
          onClose={() => {
            setShowTaskForm(false);
            setTaskToEdit(null);
          }}
          sprintId={sprint.id}
          columnId={activeColumnId}
          taskToEdit={taskToEdit || undefined}
        />
      )}
    </div>
  );
};

export default SprintBoard;
