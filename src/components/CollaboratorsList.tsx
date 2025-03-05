
import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash } from "lucide-react";
import { CollaboratorForm } from "@/components/CollaboratorForm";

interface CollaboratorsListProps {
  projectId: string;
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({ projectId }) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const { getProjectCollaborators, removeCollaborator } = useProject();

  const collaborators = getProjectCollaborators(projectId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Collaborators</CardTitle>
        <Button size="sm" onClick={() => setShowInviteForm(true)}>
          Invite
        </Button>
      </CardHeader>
      <CardContent>
        {collaborators.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No collaborators yet</p>
        ) : (
          <div className="space-y-4">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{collaborator.email}</div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      collaborator.role === "admin" 
                        ? "default" 
                        : collaborator.role === "editor" 
                          ? "outline" 
                          : "secondary"
                    }>
                      {collaborator.role}
                    </Badge>
                    <Badge variant={collaborator.status === "active" ? "default" : "outline"}>
                      {collaborator.status}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeCollaborator(collaborator.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                <Separator className="my-2" />
              </div>
            ))}
          </div>
        )}
        {showInviteForm && (
          <CollaboratorForm 
            projectId={projectId}
            onClose={() => setShowInviteForm(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CollaboratorsList;
