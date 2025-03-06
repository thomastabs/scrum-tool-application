
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProjectFormData } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProject } from "@/context/ProjectContext";
import { X } from "lucide-react";
import { createProjectInDB, getSession } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  endGoal: z.string().min(10, "End goal must be at least 10 characters"),
});

interface ProjectFormProps {
  onClose: () => void;
  projectToEdit?: {
    id: string;
    title: string;
    description: string;
    endGoal: string;
  };
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onClose, projectToEdit }) => {
  const { createProject, updateProject } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!projectToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: projectToEdit?.title || "",
      description: projectToEdit?.description || "",
      endGoal: projectToEdit?.endGoal || "",
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);
      
      if (isEditMode && projectToEdit) {
        updateProject(projectToEdit.id, data);
      } else {
        // Get current user's ID before creating the project
        const { session, error } = await getSession();
        
        if (error || !session?.user) {
          toast({
            title: "Authentication Error",
            description: "You must be logged in to create a project",
            variant: "destructive",
          });
          return;
        }
        
        // Create project in the database
        const { data: newProject, error: createError } = await createProjectInDB(data, session.user.id);
        
        if (createError) {
          throw new Error(createError.message);
        }
        
        if (newProject) {
          createProject(newProject);
          toast({
            title: "Success",
            description: "Project created successfully",
          });
        }
      }
      onClose();
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {isEditMode ? "Edit Project" : "Create New Project"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
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
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project title" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your project a clear and descriptive title.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the purpose and scope of this project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Goal</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project end goal"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What is the ultimate objective of this project?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></span>
                    {isEditMode ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  isEditMode ? "Update Project" : "Create Project"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ProjectForm;
