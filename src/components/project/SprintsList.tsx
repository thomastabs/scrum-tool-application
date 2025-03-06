
import React from "react";
import { Sprint } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import SprintCard from "@/components/sprint/SprintCard";

interface SprintsListProps {
  sprints: Sprint[];
  projectId: string;
  onCreateSprint: () => void;
  onEditSprint: (sprint: Sprint) => void;
}

const SprintsList: React.FC<SprintsListProps> = ({ 
  sprints, 
  projectId, 
  onCreateSprint, 
  onEditSprint 
}) => {
  if (sprints.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No Sprints Yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first sprint to start managing tasks.
        </p>
        <Button onClick={onCreateSprint}>
          <PlusIcon className="h-4 w-4 mr-1" /> Create Sprint
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sprints.map((sprint) => (
        <SprintCard
          key={sprint.id}
          sprint={sprint}
          projectId={projectId}
          onEdit={onEditSprint}
        />
      ))}
    </div>
  );
};

export default SprintsList;
