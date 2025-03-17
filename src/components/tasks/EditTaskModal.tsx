
import React, { useState, useEffect } from "react";
import { useProjects } from "@/context/ProjectContext";
import { X, Edit } from "lucide-react";
import { toast } from "sonner";

interface EditTaskModalProps {
  taskId: string;
  onClose: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ 
  taskId,
  onClose
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [storyPoints, setStoryPoints] = useState<number>(1);
  
  const { getTask, updateTask } = useProjects();
  
  useEffect(() => {
    const task = getTask(taskId);
    
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority || "medium");
      setAssignedTo(task.assignedTo || "");
      setStoryPoints(task.storyPoints || 1);
    }
  }, [taskId, getTask]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    if (!description.trim()) {
      toast.error("Task description is required");
      return;
    }
    
    if (!storyPoints || storyPoints < 1) {
      toast.error("Task must have at least 1 story point");
      return;
    }
    
    try {
      await updateTask(taskId, {
        title,
        description,
        priority,
        assignedTo,
        storyPoints
      });
      
      toast.success("Task updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };
  
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
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="scrum-input"
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm">
                Priority <span className="text-destructive">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
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
                  setStoryPoints(value < 1 ? 1 : value);
                }}
                className="scrum-input"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 text-sm">
              Assigned To <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="scrum-input"
              required
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
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
