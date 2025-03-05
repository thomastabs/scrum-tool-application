
import React from "react";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import CollaboratorForm from "@/components/CollaboratorForm";

const CollaboratorsList = () => {
  const [showCollaboratorForm, setShowCollaboratorForm] = React.useState(false);
  const { selectedProject } = useProject();

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Collaborators</h3>
        <Button onClick={() => setShowCollaboratorForm(true)}>
          Add Collaborator
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Collaborator functionality will be implemented in a future update.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This feature is currently under development.</p>
        </CardContent>
      </Card>

      {showCollaboratorForm && (
        <CollaboratorForm 
          onClose={() => setShowCollaboratorForm(false)}
        />
      )}
    </div>
  );
};

export default CollaboratorsList;
