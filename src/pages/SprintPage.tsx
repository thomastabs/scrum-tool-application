
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { Task, BoardColumn } from "@/types";
import TaskForm from "@/components/TaskForm";
import SprintHeader from "@/components/sprint/SprintHeader";
import SprintColumn from "@/components/sprint/SprintColumn";
import AddColumn from "@/components/sprint/AddColumn";
import { Button } from "@/components/ui/button";
import { getColumnsForSprint, createColumnInDB, deleteColumnFromDB } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const SprintPage = () => {
  const { projectId, sprintId } = useParams<{ projectId: string, sprintId: string }>();
  const navigate = useNavigate();
  const { projects, sprints, columns, createColumn, deleteColumn, moveTask, completeSprint } = useProject();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [localColumns, setLocalColumns] = useState<BoardColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Find the project and sprint
  const project = projects.find(p => p.id === projectId);
  const sprint = sprints.find(s => s.id === sprintId);

  useEffect(() => {
    if (sprintId) {
      const fetchColumns = async () => {
        setIsLoading(true);
        const { data, error } = await getColumnsForSprint(sprintId);
        
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
              .filter(task => task.sprintId === sprintId)
              .filter(task => task.columnId === col.id) || [],
            isDefault: ['TO DO', 'IN PROGRESS', 'DONE'].includes(col.title)
          }));
          setLocalColumns(formattedColumns);
        }
        setIsLoading(false);
      };

      fetchColumns();
    }
  }, [sprintId, columns]);

  if (!project || !sprint) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Sprint Not Found</h2>
          <p className="mb-6">The sprint you're looking for does not exist.</p>
          <Button asChild>
            <Link to={projectId ? `/my-projects/${projectId}` : "/?tab=projects"}>Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }

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

  // Check if all tasks are completed
  const allTasksCompleted = () => {
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">Loading columns...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(`/my-projects/${projectId}`)}
        className="mb-6"
      >
        ← Back to Project
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

export default SprintPage;
