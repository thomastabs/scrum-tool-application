
import React, { useState, useEffect } from "react";
import { Sprint, Task, BoardColumn } from "@/types";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import SprintHeader from "@/components/sprint/SprintHeader";
import SprintColumn from "@/components/sprint/SprintColumn";
import AddColumn from "@/components/sprint/AddColumn";
import TaskForm from "@/components/TaskForm";
import { getColumnsForSprint, createColumnInDB, deleteColumnFromDB } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface SprintBoardProps {
  sprint: Sprint;
  onClose: () => void;
}

const SprintBoard: React.FC<SprintBoardProps> = ({ sprint, onClose }) => {
  const { columns, createColumn, deleteColumn, moveTask, completeSprint } = useProject();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [localColumns, setLocalColumns] = useState<BoardColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchColumns = async () => {
      setIsLoading(true);
      const { data, error } = await getColumnsForSprint(sprint.id);
      
      if (error) {
        toast({
          title: "Error fetching columns",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        // Format columns to match the expected structure
        const formattedColumns = data.map(col => ({
          ...col,
          tasks: columns
            .flatMap(c => c.tasks)
            .filter(task => task.sprintId === sprint.id)
            .filter(task => task.columnId === col.id) || [],
          isDefault: ['TO DO', 'IN PROGRESS', 'DONE'].includes(col.title)
        }));
        setLocalColumns(formattedColumns);
      }
      setIsLoading(false);
    };

    fetchColumns();
  }, [sprint.id, columns]);

  // Check if all tasks are completed for a sprint
  const allTasksCompleted = () => {
    if (!sprint) return false;
    
    const doneColumn = localColumns.find(column => column.title === "DONE");
    if (!doneColumn) return false;
    
    // Get all tasks for this sprint
    const sprintTasks = columns.flatMap(col => 
      col.tasks.filter(task => task.sprintId === sprint.id)
    );
    
    // Count total tasks for this sprint
    const totalTasks = sprintTasks.length;
    
    // Count tasks in DONE column
    const doneTasks = doneColumn.tasks.length;
    
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

  const handleAddColumn = async (name: string) => {
    try {
      const { data, error } = await createColumnInDB(sprint.id, name);
      if (error) {
        toast({
          title: "Error creating column",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        // Add column to local state
        setLocalColumns(prev => [...prev, {
          ...data,
          tasks: [],
          isDefault: false
        }]);
        // Also add to global state
        createColumn(name);
      }
    } catch (error) {
      console.error("Error creating column:", error);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      const { error } = await deleteColumnFromDB(columnId);
      if (error) {
        toast({
          title: "Error deleting column",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Remove from local state
        setLocalColumns(prev => prev.filter(col => col.id !== columnId));
        // Also remove from global state
        deleteColumn(columnId);
      }
    } catch (error) {
      console.error("Error deleting column:", error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading columns...</div>;
  }

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
        {localColumns.map((column) => (
          <SprintColumn 
            key={column.id}
            column={column}
            sprintId={sprint.id}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteColumn={handleDeleteColumn}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            isDefaultColumn={column.isDefault || false}
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
          taskToEdit={taskToEdit}
        />
      )}
    </div>
  );
};

export default SprintBoard;
