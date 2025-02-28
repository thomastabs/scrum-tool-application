
import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Sprint, Column, Task } from "@/types";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SprintBoardProps {
  sprint: Sprint;
}

const SprintBoard: React.FC<SprintBoardProps> = ({ sprint }) => {
  const { columns, createColumn, deleteColumn, moveTask, completeSprint } = useProject();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  // Filter columns that have tasks for this sprint or create default columns if needed
  const defaultColumns = ["TO DO", "IN PROGRESS", "DONE"];
  
  // Get all columns that have tasks for this sprint
  let sprintColumns = columns.filter(column =>
    column.tasks.some(task => task.sprintId === sprint.id)
  );
  
  // Get the titles of columns that already exist for this sprint
  const existingColumnTitles = new Set(sprintColumns.map(col => col.title));
  
  // Add default columns if they don't exist for this sprint
  defaultColumns.forEach(title => {
    if (!existingColumnTitles.has(title)) {
      const defaultColumn: Column = {
        id: `${title.toLowerCase().replace(/\s+/g, '-')}-${sprint.id}`,
        title,
        tasks: []
      };
      
      sprintColumns.push(defaultColumn);
    }
  });

  // Sort columns to ensure consistent order with default columns first
  sprintColumns.sort((a, b) => {
    const aIndex = defaultColumns.indexOf(a.title);
    const bIndex = defaultColumns.indexOf(b.title);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.title.localeCompare(b.title);
  });

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setShowTaskForm(true);
    setActiveColumnId(task.columnId);
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

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      // Prevent creating a column with a default name
      if (defaultColumns.includes(newColumnName.trim())) {
        alert(`Cannot create a new column named "${newColumnName.trim()}" as it's a reserved name.`);
        return;
      }
      
      createColumn(sprint.id, newColumnName.trim());
      setNewColumnName("");
      setShowAddColumn(false);
    }
  };

  // Check if all tasks are in DONE column
  const allTasksCompleted = () => {
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{sprint.title}</h2>
          <p className="text-muted-foreground">
            {sprint.description}
          </p>
          <div className="flex gap-4 mt-2 text-sm">
            <span>Start: {new Date(sprint.startDate).toLocaleDateString()}</span>
            <span>End: {new Date(sprint.endDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {!sprint.isCompleted && (
            <Button
              variant="outline" 
              onClick={() => completeSprint(sprint.id)}
              disabled={!allTasksCompleted()}
            >
              Complete Sprint
            </Button>
          )}
        </div>
      </div>

      {sprint.isCompleted && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle>Sprint Completed</AlertTitle>
          <AlertDescription>
            This sprint has been marked as completed.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {sprintColumns.map((column) => (
          <div
            key={column.id}
            className="board-column bg-gray-50 p-4 rounded-lg border border-gray-200"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">{column.title}</h3>
              <div className="flex gap-1">
                {!defaultColumns.includes(column.title) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => deleteColumn(column.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleAddTask(column.id)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {column.tasks
                .filter(task => task.sprintId === sprint.id)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                  />
                ))}
            </div>
          </div>
        ))}

        {!showAddColumn ? (
          <div 
            className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setShowAddColumn(true)}
          >
            <div className="flex flex-col items-center">
              <Plus className="h-5 w-5 mb-1 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Add Column</span>
            </div>
          </div>
        ) : (
          <div className="board-column bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddColumn}>
                  Add
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
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
