
import React from "react";
import { useProject } from "@/context/ProjectContext";
import { useParams, useNavigate } from "react-router-dom";
import SprintBoard from "@/components/SprintBoard";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

const SprintPage = () => {
  const { projectId, sprintId } = useParams<{ projectId: string; sprintId: string }>();
  const { projects, sprints } = useProject();
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === projectId);
  const sprint = sprints.find((s) => s.id === sprintId);

  if (!project || !sprint) {
    navigate("/projects");
    return null;
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <Button
        variant="ghost"
        onClick={() => navigate(`/projects/${projectId}`)}
        className="mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Project
      </Button>

      <SprintBoard sprint={sprint} />
    </div>
  );
};

export default SprintPage;
