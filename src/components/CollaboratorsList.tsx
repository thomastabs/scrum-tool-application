
import React, { useEffect, useState } from "react";
import { getProjectCollaborators, removeCollaborator } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrashIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CollaboratorsListProps {
  projectId: string;
  isOwner: boolean;
}

interface Collaborator {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  users: {
    email: string;
  };
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({
  projectId,
  isOwner,
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const { data, error } = await getProjectCollaborators(projectId);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load collaborators",
          variant: "destructive",
        });
      } else if (data) {
        setCollaborators(data as unknown as Collaborator[]);
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [projectId]);

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (window.confirm("Are you sure you want to remove this collaborator?")) {
      try {
        const { error } = await removeCollaborator(collaboratorId);
        if (error) {
          toast({
            title: "Error",
            description: "Failed to remove collaborator",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Collaborator removed successfully",
          });
          fetchCollaborators();
        }
      } catch (error) {
        console.error("Error removing collaborator:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading collaborators...</div>;
  }

  if (collaborators.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No collaborators for this project yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Added</TableHead>
            {isOwner && <TableHead className="w-[80px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {collaborators.map((collaborator) => (
            <TableRow key={collaborator.id}>
              <TableCell>{collaborator.users.email}</TableCell>
              <TableCell className="capitalize">{collaborator.role}</TableCell>
              <TableCell>
                {new Date(collaborator.created_at).toLocaleDateString()}
              </TableCell>
              {isOwner && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                    className="text-destructive"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CollaboratorsList;
