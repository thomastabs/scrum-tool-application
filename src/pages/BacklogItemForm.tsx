
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useProjects } from "@/context/ProjectContext";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]),
  storyPoints: z.coerce.number().min(1, "At least 1 story point is required").max(100),
});

interface BacklogItemFormProps {
  taskId?: string;
  onClose: () => void;
  projectId?: string;
}

const BacklogItemForm: React.FC<BacklogItemFormProps> = ({ taskId, onClose, projectId }) => {
  const { getTask, addTask, updateTask } = useProjects();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const isEditMode = !!taskId;
  
  // Get project ID from params if not provided through props
  const currentProjectId = projectId || params.projectId || "";
  
  // Get the task to edit if in edit mode
  const taskToEdit = isEditMode && taskId ? getTask(taskId) : null;

  // If onClose is not provided, use navigate to go back
  const handleClose = onClose || (() => navigate(-1));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: taskToEdit?.title || "",
      description: taskToEdit?.description || "",
      priority: (taskToEdit?.priority as "low" | "medium" | "high") || "medium",
      storyPoints: taskToEdit?.storyPoints || 1,
    },
  });

  // Update form when task is loaded
  useEffect(() => {
    if (taskToEdit) {
      form.reset({
        title: taskToEdit.title,
        description: taskToEdit.description || "",
        priority: (taskToEdit.priority as "low" | "medium" | "high") || "medium",
        storyPoints: taskToEdit.storyPoints || 1,
      });
    }
  }, [taskToEdit, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    
    try {
      if (!user) {
        toast.error("You must be logged in to create a backlog item");
        return;
      }
      
      if (isEditMode && taskId) {
        // Update existing task
        await updateTask(taskId, {
          title: data.title,
          description: data.description,
          priority: data.priority,
          storyPoints: data.storyPoints,
        });
        toast.success("Backlog item updated successfully");
      } else {
        // Create new task
        if (!currentProjectId) {
          toast.error("Project ID is required to create a backlog item");
          return;
        }
        
        console.log('Creating new backlog item with project ID:', currentProjectId);
        
        // Direct Supabase insert as a fallback method
        if (user) {
          const { data: insertData, error } = await supabase
            .from('tasks')
            .insert([{
              title: data.title,
              description: data.description,
              status: "backlog",
              sprint_id: null,
              project_id: currentProjectId,
              priority: data.priority,
              story_points: data.storyPoints,
              user_id: user.id
            }]);
            
          if (error) {
            console.error("Supabase error:", error);
            throw error;
          } else {
            toast.success("Backlog item created successfully");
          }
        } else {
          // Try using the context method as originally intended
          await addTask({
            title: data.title,
            description: data.description,
            status: "backlog",
            projectId: currentProjectId,
            priority: data.priority,
            storyPoints: data.storyPoints,
            sprintId: "",
          });
          toast.success("Backlog item created successfully");
        }
      }
      
      handleClose();
    } catch (error) {
      console.error("Error creating/updating backlog item:", error);
      toast.error(`Error ${isEditMode ? 'updating' : 'creating'} backlog item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {isEditMode ? "Edit Backlog Item" : "Create Backlog Item"}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter item description"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority <span className="text-destructive">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storyPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Points <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEditMode ? "Update Item" : "Create Item"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default BacklogItemForm;
