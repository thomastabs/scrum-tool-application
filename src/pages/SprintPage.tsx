
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { Task, Sprint } from "@/types";
import TaskForm from "@/components/TaskForm";
import SprintHeader from "@/components/sprint/SprintHeader";
import SprintColumn from "@/components/sprint/SprintColumn";
import AddColumn from "@/components/sprint/AddColumn";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProjectFromDB, getSprintFromDB } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import ProjectNotFound from "@/components/project/ProjectNotFound";

const SprintPage = () => {
  const { projectId, sprintId } = useParams<{ projectId: string, sprintId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { columns, createColumn, deleteColumn, moveTask, completeSprint } = useProject();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  // Fetch project data
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await getProjectFromDB(projectId);
      if (error) {
        console.error("Error fetching project:", error);
        throw error;
      }
      
      return data;
    },
  });

  // Fetch sprint data with improved error handling
  const { data: sprint, isLoading: sprintLoading, error: sprintError } = useQuery({
    queryKey: ['sprint', sprintId],
    queryFn: async () => {
      if (!sprintId) return null;

      try {
        const { data, error } = await getSprintFromDB(sprintId);
        
        if (error) {
          console.error("Error fetching sprint:", error);
          throw error;
        }
        
        if (!data) {
          console.error("Sprint not found");
          return null;
        }
        
        return {
          id: data.id,
          projectId: data.project_id,
          title: data.title,
          description: data.description || '',
          startDate: new Date(data.start_date),
          endDate: new Date(data.end_date),
          isCompleted: data.status === 'completed',
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.created_at),
          justification: data.justification || '',
        } as Sprint;
      } catch (error) {
        console.error("Error processing sprint data:", error);
        throw error;
      }
    },
    meta: {
      onError: (error: Error) => {
        console.error("Error in sprint query:", error);
        toast({
          title: "Error",
          description: "Failed to load sprint details. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  // Only get the ONE instance of each standard column that we need
  const todoColumn = columns.find(column => column.title === "TO DO");
  const inProgressColumn = columns.find(column => column.title === "IN PROGRESS");
  const doneColumn = columns.find(column => column.title === "DONE");

  // Get custom columns that have tasks for this sprint
  const customColumns = columns.filter(column => 
    column.title !== "TO DO" && 
    column.title !== "IN PROGRESS" && 
    column.title !== "DONE" &&
    column.tasks.some(task => task.sprintId === sprintId)
  );

  // Combine all columns used by this sprint
  const sprintColumns = [
    todoColumn,
    inProgressColumn,
    doneColumn,
    ...customColumns
  ].filter(Boolean) as any[];

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
    if (!doneColumn || !sprintId) return false;
    
    // Count total tasks for this sprint
    const totalTasks = sprintColumns.reduce(
      (count, column) => count + column.tasks.filter(task => task.sprintId === sprintId).length,
      0
    );
    
    // Count tasks in DONE column
    const doneTasks = doneColumn.tasks.filter(task => task.sprintId === sprintId).length;
    
    // If there are no tasks, sprint can't be completed
    if (totalTasks === 0) return false;
    
    // Check if all tasks are in DONE column
    return doneTasks === totalTasks;
  };

  // Handle navigation back to project
  const handleBackToProject = () => {
    if (projectId) {
      navigate(`/my-projects/${projectId}`);
    } else {
      navigate("/?tab=projects");
    }
  };

  // Loading state
  if (projectLoading || sprintLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center p-8">
          <div className="animate-pulse">Loading sprint details...</div>
        </div>
      </div>
    );
  }

  // Not found states - more specific error messages
  if (!project) {
    return <ProjectNotFound />;
  }

  if (!sprint) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Sprint Not Found</h2>
          <p className="mb-6">The sprint you're looking for does not exist or has been deleted.</p>
          <Button onClick={handleBackToProject}>
            Go Back to Project
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={handleBackToProject}
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

export default SprintPage;
