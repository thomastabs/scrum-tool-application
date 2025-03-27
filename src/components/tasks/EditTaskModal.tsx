
import React, { useState, useEffect, useMemo } from "react";
import { useProjects } from "@/context/ProjectContext";
import { X, Edit, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ProjectRole, Collaborator } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

interface EditTaskModalProps {
  taskId: string;
  onClose: () => void;
  onTaskUpdated?: (updatedTask: any) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ 
  taskId,
  onClose,
  onTaskUpdated
}) => {
  const [task, setTask] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [storyPoints, setStoryPoints] = useState<number>(1);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [projectOwner, setProjectOwner] = useState<{id: string, username: string} | null>(null);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(true);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [completionDate, setCompletionDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<string>("todo");
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { getTask, updateTask } = useProjects();
  
  // Initialize task data
  useEffect(() => {
    async function loadTaskData() {
      // Try to get from context first (fast)
      const contextTask = getTask(taskId);
      
      if (contextTask) {
        initializeTaskState(contextTask);
        setProjectId(contextTask.projectId);
        
        // If we have projectId, fetch collaborators
        if (contextTask.projectId) {
          fetchCollaborators(contextTask.projectId);
        }
      } else {
        // Fallback to direct fetch if not in context
        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', taskId)
            .single();
            
          if (error) throw error;
          if (data) {
            initializeTaskState(data);
            setProjectId(data.project_id);
            
            // If we have projectId, fetch collaborators
            if (data.project_id) {
              fetchCollaborators(data.project_id);
            }
          }
        } catch (error) {
          console.error("Error fetching task data:", error);
          toast.error("Failed to load task data");
          onClose();
        }
      }
    }
    
    loadTaskData();
  }, [taskId, getTask]);
  
  // Helper function to initialize all state from task data
  const initializeTaskState = (taskData: any) => {
    setTask(taskData);
    setTitle(taskData.title || "");
    setDescription(taskData.description || "");
    setPriority(taskData.priority || "medium");
    setAssignedTo(taskData.assignedTo || taskData.assign_to || "");
    setStoryPoints(taskData.storyPoints || taskData.story_points || 1);
    setStatus(taskData.status || "todo");
    
    // Handle completion date
    const dateStr = taskData.completionDate || taskData.completion_date;
    if (dateStr) {
      try {
        setCompletionDate(parseISO(dateStr));
      } catch (err) {
        console.error("Error parsing date:", err);
      }
    }
    
    setIsInitialized(true);
  };
  
  const fetchCollaborators = async (projectId: string) => {
    setIsLoadingCollaborators(true);
    try {
      // Use Promise.all to run these requests in parallel
      const [projectResponse, collaboratorsResponse] = await Promise.all([
        // Fetch project owner
        supabase
          .from('projects')
          .select('owner_id, title')
          .eq('id', projectId)
          .single(),
          
        // Fetch collaborators
        supabase
          .from('collaborators')
          .select(`
            id,
            userId:user_id,
            role,
            createdAt:created_at,
            users:user_id (
              id,
              username,
              email
            )
          `)
          .eq('project_id', projectId)
      ]);
      
      // Handle project owner data
      if (!projectResponse.error && projectResponse.data) {
        const ownerResponse = await supabase
          .from('users')
          .select('id, username')
          .eq('id', projectResponse.data.owner_id)
          .single();
          
        if (!ownerResponse.error && ownerResponse.data) {
          setProjectOwner(ownerResponse.data);
        }
      }
      
      // Handle collaborators data
      if (!collaboratorsResponse.error && collaboratorsResponse.data) {
        const formattedCollaborators = collaboratorsResponse.data.map(collab => ({
          id: collab.id,
          userId: collab.userId,
          username: collab.users ? (collab.users as any).username || '' : '',
          email: collab.users ? (collab.users as any).email || '' : '',
          role: collab.role as ProjectRole,
          createdAt: collab.createdAt
        }));
        
        setCollaborators(formattedCollaborators);
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    } finally {
      setIsLoadingCollaborators(false);
    }
  };
  
  // Memoize assignee options to prevent recalculation on every render
  const assigneeOptions = useMemo(() => {
    const options = [];
    
    if (projectOwner) {
      options.push({ id: projectOwner.id, name: projectOwner.username });
    }
    
    options.push(...collaborators.map(collab => ({ 
      id: collab.userId,
      name: collab.username 
    })));
    
    return options;
  }, [projectOwner, collaborators]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    try {
      const updatedData = {
        title,
        description,
        priority,
        assignedTo,
        storyPoints,
        status,
        completionDate: completionDate ? format(completionDate, "yyyy-MM-dd") : null
      };
      
      // Use direct Supabase update to ensure completion_date is properly saved
      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update({
          title: updatedData.title,
          description: updatedData.description,
          status: updatedData.status,
          assign_to: updatedData.assignedTo,
          story_points: updatedData.storyPoints,
          priority: updatedData.priority,
          completion_date: updatedData.completionDate
        })
        .eq('id', taskId)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating task:", error);
        throw error;
      }
      
      // Also update the local state through context
      await updateTask(taskId, updatedData);
      
      // Call the onTaskUpdated callback with the updated task data if provided
      if (onTaskUpdated && updatedTask) {
        onTaskUpdated(updatedTask);
      }
      
      toast.success("Task updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };
  
  // Show loading state while task data or collaborators are loading
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-scrum-card border border-scrum-border rounded-lg p-6 w-full max-w-lg animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>Loading Task...</span>
            </h2>
            <button
              onClick={onClose}
              className="text-scrum-text-secondary hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="h-10 bg-scrum-background/30 rounded animate-pulse"></div>
            <div className="h-24 bg-scrum-background/30 rounded animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-scrum-background/30 rounded animate-pulse"></div>
              <div className="h-10 bg-scrum-background/30 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-scrum-card border border-scrum-border rounded-lg p-6 w-full max-w-lg animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Edit className="h-4 w-4" />
            <span>Edit Task</span>
          </h2>
          <button
            onClick={onClose}
            className="text-scrum-text-secondary hover:text-white"
          >
            <X className="h-5 w-5" />
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
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm">
                Priority <span className="text-destructive">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                className="scrum-input"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-sm">
                Story Points <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={storyPoints}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setStoryPoints(isNaN(value) ? 1 : Math.max(1, value));
                }}
                className="scrum-input"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm">
                Status <span className="text-destructive">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="scrum-input"
                required
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-sm">
                Completion Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`scrum-input flex justify-between items-center text-left font-normal ${!completionDate && "text-muted-foreground"}`}
                  >
                    {completionDate ? format(completionDate, "PPP") : "Select date"}
                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={completionDate}
                    onSelect={setCompletionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 text-sm">
              Assigned To
            </label>
            {isLoadingCollaborators ? (
              <div className="scrum-input flex items-center">
                <div className="h-5 w-5 mr-2 rounded-full bg-scrum-accent/30 animate-pulse"></div>
                <span className="text-scrum-text-secondary">Loading collaborators...</span>
              </div>
            ) : (
              assigneeOptions.length > 0 ? (
                <Select 
                  value={assignedTo} 
                  onValueChange={setAssignedTo}
                >
                  <SelectTrigger className="bg-scrum-background border-scrum-border text-scrum-text focus:ring-scrum-accent focus:border-scrum-border">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent className="bg-scrum-card border-scrum-border">
                    {assigneeOptions.map(option => (
                      <SelectItem 
                        key={option.id} 
                        value={option.name}
                        className="text-scrum-text focus:bg-scrum-accent/20 focus:text-scrum-text"
                      >
                        <div className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-2 text-scrum-text-secondary" />
                          {option.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="scrum-input"
                  placeholder="Enter name or email"
                />
              )
            )}
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
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
