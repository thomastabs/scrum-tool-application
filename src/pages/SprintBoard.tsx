import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Plus, Edit, Trash, Play, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import TaskCard from "@/components/tasks/TaskCard";
import EditTaskModal from "@/components/tasks/EditTaskModal";
import AddColumnModal from "@/components/sprints/AddColumnModal";
import { fetchSprintColumns, addCustomColumn, createDefaultColumn, deleteColumn } from "@/lib/supabase";

const SprintBoard: React.FC = () => {
  const { sprintId } = useParams<{ sprintId: string }>();
  const { getSprint, getTasksBySprint, updateSprint, updateTask } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [columns, setColumns] = useState<{[key: string]: {title: string, taskIds: string[], id?: string}}>(
    {
      "todo": { title: "TO DO", taskIds: [] },
      "in-progress": { title: "IN PROGRESS", taskIds: [] },
      "done": { title: "DONE", taskIds: [] }
    }
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(["todo", "in-progress", "done"]);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [creatingTaskInColumn, setCreatingTaskInColumn] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState(0); // Add refresh trigger
  
  const sprint = getSprint(sprintId || "");
  const tasks = getTasksBySprint(sprintId || "");
  
  // Force refresh of tasks
  const refreshTasks = () => {
    console.log("Refreshing tasks...");
    setTaskRefreshTrigger(prev => prev + 1);
  };
  
  useEffect(() => {
    const loadCustomColumns = async () => {
      if (!sprint || !user) return;
      
      setIsLoading(true);
      try {
        const customColumns = await fetchSprintColumns(sprint.id, user.id);
        
        if (customColumns.length === 0) {
          const defaultColumnTitles = ["TO DO", "IN PROGRESS", "DONE"];
          const defaultStatuses = ["todo", "in-progress", "done"];
          
          const createdColumns = [];
          for (let i = 0; i < defaultColumnTitles.length; i++) {
            const column = await createDefaultColumn(
              sprint.id,
              user.id,
              defaultColumnTitles[i],
              i
            );
            if (column) {
              createdColumns.push({
                id: column.id,
                status: defaultStatuses[i],
                title: column.title,
                orderIndex: column.order_index
              });
            }
          }
          
          initializeColumns(createdColumns);
        } else {
          initializeColumns(customColumns.map(col => ({
            id: col.id,
            status: col.title.toLowerCase().replace(/\s+/g, '-'),
            title: col.title,
            orderIndex: col.order_index
          })));
        }
      } catch (error) {
        console.error("Error loading columns:", error);
        toast.error("Failed to load board columns");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCustomColumns();
  }, [sprint, user, taskRefreshTrigger]); // Add taskRefreshTrigger as dependency
  
  const initializeColumns = (columnsData: any[]) => {
    const initialColumns: {[key: string]: {title: string, taskIds: string[], id?: string}} = {};
    const newColumnOrder: string[] = [];
    
    columnsData.sort((a, b) => a.orderIndex - b.orderIndex);
    
    columnsData.forEach(col => {
      const colId = col.status;
      initialColumns[colId] = {
        title: col.title,
        taskIds: [],
        id: col.id
      };
      newColumnOrder.push(colId);
    });
    
    tasks.forEach(task => {
      if (initialColumns[task.status]) {
        initialColumns[task.status].taskIds.push(task.id);
      } else if (initialColumns["todo"]) {
        initialColumns["todo"].taskIds.push(task.id);
      }
    });
    
    setColumns(initialColumns);
    setColumnOrder(newColumnOrder);
  };
  
  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    
    if (
      destination.droppableId === source.droppableId && 
      destination.index === source.index
    ) {
      return;
    }
    
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    
    if (source.droppableId === destination.droppableId) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      
      const newColumn = {
        ...sourceColumn,
        taskIds: newTaskIds,
      };
      
      setColumns({
        ...columns,
        [source.droppableId]: newColumn,
      });
    } 
    else {
      const sourceTaskIds = Array.from(sourceColumn.taskIds);
      sourceTaskIds.splice(source.index, 1);
      
      const destTaskIds = Array.from(destColumn.taskIds);
      destTaskIds.splice(destination.index, 0, draggableId);
      
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          taskIds: sourceTaskIds,
        },
        [destination.droppableId]: {
          ...destColumn,
          taskIds: destTaskIds,
        },
      });
      
      try {
        await updateTask(draggableId, {
          status: destination.droppableId
        });
        
        if (destination.droppableId === "done") {
          const allTasks = tasks;
          const remainingTasks = allTasks.filter(
            task => task.id !== draggableId && task.status !== "done"
          );
          
          if (remainingTasks.length === 0 && sprint?.status === "in-progress") {
            if (window.confirm("All tasks are completed! Would you like to mark this sprint as completed?")) {
              await updateSprint(sprint.id, { status: "completed" });
              toast.success("Sprint marked as completed!");
            }
          }
        }
      } catch (error) {
        console.error("Error updating task status:", error);
        toast.error("Failed to update task status");
      }
    }
  };
  
  const handleAddColumn = async (columnName: string) => {
    if (!columnName.trim() || !user) return;
    
    const columnId = columnName.toLowerCase().replace(/\s+/g, '-');
    
    if (columns[columnId]) {
      toast.error("A column with this name already exists");
      return;
    }
    
    try {
      const newColumn = await addCustomColumn(
        sprint?.id || "",
        user.id,
        columnName,
        columnOrder.length
      );
      
      if (!newColumn) {
        throw new Error("Failed to create column");
      }
      
      setColumns(prev => ({
        ...prev,
        [columnId]: {
          title: columnName,
          taskIds: [],
          id: newColumn.id
        }
      }));
      
      setColumnOrder(prev => [...prev, columnId]);
      setIsAddColumnModalOpen(false);
      toast.success(`Column "${columnName}" added`);
    } catch (error) {
      console.error("Error adding column:", error);
      toast.error("Failed to add column");
    }
  };
  
  const handleRemoveColumn = async (columnId: string) => {
    if (["todo", "in-progress", "done"].includes(columnId)) {
      toast.error("Cannot remove default columns");
      return;
    }
    
    if (columns[columnId]?.taskIds.length > 0) {
      toast.error("Cannot remove a column that contains tasks");
      return;
    }
    
    try {
      const columnDbId = columns[columnId]?.id;
      
      if (columnDbId) {
        await deleteColumn(columnDbId);
      }
      
      const newColumns = { ...columns };
      delete newColumns[columnId];
      
      setColumns(newColumns);
      setColumnOrder(columnOrder.filter(id => id !== columnId));
      toast.success("Column removed");
    } catch (error) {
      console.error("Error removing column:", error);
      toast.error("Failed to remove column");
    }
  };
  
  const handleCreateTaskInColumn = (columnId: string) => {
    setCreatingTaskInColumn(columnId);
  };
  
  const handleCompleteSprint = async () => {
    if (!allTasksCompleted) {
      if (!window.confirm("Not all tasks are completed. Are you sure you want to complete this sprint?")) {
        return;
      }
    }
    
    try {
      await updateSprint(sprint.id, { status: "completed" });
      toast.success("Sprint marked as completed!");
    } catch (error) {
      console.error("Error completing sprint:", error);
      toast.error("Failed to complete sprint");
    }
  };
  
  if (!sprint) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-4">Sprint not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="scrum-button"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  const allTasksCompleted = tasks.length > 0 && tasks.every(task => task.status === "done");
  
  return (
    <div className="container mx-auto pb-20 px-4">
      <SprintHeader 
        sprint={sprint}
        onCompleteSprint={handleCompleteSprint}
      />
      
      <div className="flex items-center justify-between mb-4 mt-8">
        <h3 className="text-lg font-medium">Sprint Board</h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddColumnModalOpen(true)}
            className="scrum-button-secondary flex items-center gap-1 text-sm"
            disabled={sprint.status === "completed"}
          >
            <Plus className="h-4 w-4" />
            <span>Add Column</span>
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading board...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 pb-4 overflow-x-auto">
            {columnOrder.map((columnId) => {
              const column = columns[columnId];
              
              if (!column) return null;
              
              const columnTasks = column.taskIds.map(taskId => 
                tasks.find(task => task.id === taskId)
              ).filter(Boolean);
              
              return (
                <div key={columnId} className="min-w-[270px] max-w-[270px] flex-shrink-0">
                  <div className="bg-scrum-card border border-scrum-border rounded-md h-full flex flex-col">
                    <div className="flex items-center justify-between p-3 border-b border-scrum-border">
                      <h4 className="font-medium text-sm">{column.title}</h4>
                      <div className="flex items-center">
                        {sprint.status !== "completed" && (
                          <button
                            onClick={() => handleCreateTaskInColumn(columnId)}
                            className="text-scrum-text-secondary hover:text-white transition-colors mr-2"
                            title={`Add task to ${column.title}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                        
                        {!["todo", "in-progress", "done"].includes(columnId) && (
                          <button
                            onClick={() => handleRemoveColumn(columnId)}
                            className="text-scrum-text-secondary hover:text-destructive transition-colors"
                            disabled={sprint.status === "completed"}
                            title="Remove column"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <Droppable droppableId={columnId} isDropDisabled={sprint.status === "completed"}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-2 flex-1 min-h-[300px] overflow-y-auto ${snapshot.isDraggingOver ? "bg-scrum-accent/10" : ""}`}
                        >
                          {columnTasks.map((task, index) => (
                            task && (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                                isDragDisabled={sprint.status === "completed"}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`mb-2 transition-transform duration-200 ${snapshot.isDragging ? "scale-105 shadow-lg opacity-90 z-10" : ""}`}
                                  >
                                    <TaskCard
                                      task={task}
                                      onEdit={() => setEditingTask(task.id)}
                                      isSprintCompleted={sprint.status === "completed"}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            )
                          ))}
                          {provided.placeholder}
                          
                          {columnTasks.length === 0 && (
                            <div className="text-center py-4 text-scrum-text-secondary text-sm italic">
                              No tasks
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
      
      {editingTask && (
        <EditTaskModal
          taskId={editingTask}
          onClose={() => {
            setEditingTask(null);
            refreshTasks(); // Refresh tasks after editing
          }}
        />
      )}
      
      {isAddColumnModalOpen && (
        <AddColumnModal
          onClose={() => setIsAddColumnModalOpen(false)}
          onAdd={handleAddColumn}
        />
      )}
      
      {creatingTaskInColumn && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-scrum-card border border-scrum-border rounded-lg p-6 w-full max-w-lg animate-fade-up">
            <NewTaskForm 
              sprintId={sprint.id}
              initialStatus={creatingTaskInColumn}
              onClose={() => setCreatingTaskInColumn(null)}
              onTaskCreated={refreshTasks} // Add callback for task creation
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface SprintHeaderProps {
  sprint: {
    id: string;
    title: string;
    description: string;
    projectId: string;
    startDate: string;
    endDate: string;
    status: 'planned' | 'in-progress' | 'completed';
  };
  onCompleteSprint: () => void;
}

const SprintHeader: React.FC<SprintHeaderProps> = ({ 
  sprint, 
  onCompleteSprint 
}) => {
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };
  
  return (
    <div className="flex items-center justify-between p-4 border-b border-scrum-border">
      <div>
        <h1 className="font-bold text-xl">{sprint.title}</h1>
        <div className="text-sm text-scrum-text-secondary">
          {formatDateRange(sprint.startDate, sprint.endDate)}
        </div>
      </div>
      
      <div>
        {sprint.status === "in-progress" && (
          <button
            onClick={onCompleteSprint}
            className="scrum-button-success flex items-center gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Complete Sprint</span>
          </button>
        )}
      </div>
    </div>
  );
};

const NewTaskForm: React.FC<{
  sprintId: string;
  initialStatus: string;
  onClose: () => void;
  onTaskCreated: () => void; // Add callback
}> = ({ sprintId, initialStatus, onClose, onTaskCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "">("");
  const [assignedTo, setAssignedTo] = useState("");
  const [storyPoints, setStoryPoints] = useState<number | "">("");
  
  const { addTask, getSprint } = useProjects();
  const sprint = getSprint(sprintId);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    if (!sprint) {
      toast.error("Sprint not found");
      return;
    }
    
    try {
      await addTask({
        title,
        description,
        sprintId,
        projectId: sprint.projectId,
        status: initialStatus as any,
        assignedTo: assignedTo || undefined,
        priority: priority || undefined,
        storyPoints: typeof storyPoints === 'number' ? storyPoints : undefined
      });
      
      toast.success("Task created successfully");
      onTaskCreated(); // Call the callback to refresh tasks
      onClose(); // Close the form
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  };
  
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Create New Task</h2>
        <button
          onClick={onClose}
          className="text-scrum-text-secondary hover:text-white"
        >
          <Trash className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-sm">
            Task Title <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="scrum-input"
            placeholder="e.g. Implement login functionality"
            required
            autoFocus
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="scrum-input"
            placeholder="Task details and requirements"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 text-sm">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="scrum-input"
            >
              <option value="">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2 text-sm">
              Story Points
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={storyPoints}
              onChange={(e) => {
                const value = e.target.value;
                setStoryPoints(value === "" ? "" : parseInt(value));
              }}
              className="scrum-input"
              placeholder="e.g. 5"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 text-sm">
            Assigned To
          </label>
          <input
            type="text"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="scrum-input"
            placeholder="e.g. John Doe"
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="scrum-button-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="scrum-button"
          >
            Create Task
          </button>
        </div>
      </form>
    </>
  );
};

export default SprintBoard;
