
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import SprintForm from "@/components/SprintForm";
import ProjectForm from "@/components/ProjectForm";
import ProjectHeader from "@/components/project/ProjectHeader";
import ProjectNotFound from "@/components/project/ProjectNotFound";
import ProjectTabs from "@/components/project/ProjectTabs";
import SprintBoard from "@/components/sprint/SprintBoard";
import { Sprint } from "@/types";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, sprints, deleteProject } = useProject();
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  // Find the project by ID
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return <ProjectNotFound />;
  }

  const projectSprints = sprints.filter(
    (sprint) => sprint.projectId === project.id
  );

  const handleDeleteProject = () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      // Call deleteProject directly instead of just navigating away
      deleteProject(project.id);
      navigate("/?tab=projects");
    }
  };

  const handleEditSprint = (sprint: Sprint) => {
    setSprintToEdit(sprint);
    setShowSprintForm(true);
  };

  // Function to view sprint board
  const handleViewSprintBoard = (sprint: Sprint) => {
    setSelectedSprint(sprint);
  };

  // Function to close sprint board
  const handleCloseSprintBoard = () => {
    setSelectedSprint(null);
  };

  // Render sprint board if a sprint is selected
  if (selectedSprint) {
    return (
      <div className="container mx-auto py-8">
        <SprintBoard 
          sprint={selectedSprint} 
          onClose={handleCloseSprintBoard} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <ProjectHeader 
        project={project}
        onDelete={handleDeleteProject}
        onEdit={() => setShowEditProject(true)}
        onNewSprint={() => setShowSprintForm(true)}
      />

      <ProjectTabs
        projectId={project.id}
        sprints={projectSprints}
        onCreateSprint={() => setShowSprintForm(true)}
        onEditSprint={handleEditSprint}
        onViewSprint={handleViewSprintBoard}
      />

      {showSprintForm && (
        <SprintForm
          onClose={() => {
            setShowSprintForm(false);
            setSprintToEdit(null);
          }}
          sprintToEdit={sprintToEdit ? {
            id: sprintToEdit.id,
            title: sprintToEdit.title,
            description: sprintToEdit.description || "",
            startDate: sprintToEdit.startDate,
            endDate: sprintToEdit.endDate,
          } : null}
        />
      )}

      {showEditProject && (
        <ProjectForm
          onClose={() => setShowEditProject(false)}
          projectToEdit={{
            id: project.id,
            title: project.title,
            description: project.description || "",
            endGoal: project.endGoal || "",
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
