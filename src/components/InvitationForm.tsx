
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InvitationFormData } from "@/types/collaboration";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { sendInvitation } from "@/lib/collaborationService";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["viewer", "editor", "admin"]),
  projectId: z.string().uuid(),
});

interface InvitationFormProps {
  projectId: string;
  onClose: () => void;
  onInvitationSent?: () => void;
}

const InvitationForm: React.FC<InvitationFormProps> = ({ projectId, onClose, onInvitationSent }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "viewer",
      projectId,
    },
  });

  const onSubmit = async (data: InvitationFormData) => {
    try {
      setIsSubmitting(true);
      await sendInvitation(data);
      onInvitationSent?.();
      onClose();
    } catch (error) {
      console.error("Error sending invitation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Invite Collaborator</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter collaborator's email" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the email address of the person you want to invite.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="viewer">
                        Viewer (can only view)
                      </SelectItem>
                      <SelectItem value="editor">
                        Editor (can edit but not manage collaborators)
                      </SelectItem>
                      <SelectItem value="admin">
                        Admin (full control)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the level of access for this collaborator.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default InvitationForm;
