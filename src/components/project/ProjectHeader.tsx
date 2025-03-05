
import React from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, PlusIcon } from "lucide-react";

interface ProjectHeaderProps {
  project: Project;
  onDelete: () => void;
  onEdit: () => void;
  onNewSprint: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onDelete,
  onEdit,
  onNewSprint,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => navigate("/?tab=projects")}
        className="mb-6"
      >
        ← Back to Projects
      </Button>
      
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={onDelete}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {project.description}
          </p>
        </div>
        <Button onClick={onNewSprint}>
          <PlusIcon className="h-4 w-4 mr-1" /> New Sprint
        </Button>
      </div>
    </>
  );
};

export default ProjectHeader;
