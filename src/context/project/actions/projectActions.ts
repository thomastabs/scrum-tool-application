
import { Project, Sprint, Column } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const createProject = (
  projects: Project[],
  projectData: { title: string; description: string; endGoal: string },
  toast: any
) => {
  const newProject: Project = {
    id: uuidv4(),
    title: projectData.title,
    description: projectData.description,
    endGoal: projectData.endGoal,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedProjects = [...projects, newProject];

  toast({
    title: "Project created",
    description: `${projectData.title} has been created.`,
  });

  return updatedProjects;
};

export const updateProject = (
  projects: Project[],
  id: string,
  projectData: { title: string; description: string; endGoal: string },
  toast: any
) => {
  const updatedProjects = projects.map((project) =>
    project.id === id
      ? {
          ...project,
          title: projectData.title,
          description: projectData.description,
          endGoal: projectData.endGoal,
          updatedAt: new Date(),
        }
      : project
  );

  toast({
    title: "Project updated",
    description: `${projectData.title} has been updated.`,
  });

  return updatedProjects;
};

export const deleteProject = (
  projects: Project[],
  sprints: Sprint[],
  columns: Column[],
  id: string,
  toast: any
) => {
  const projectToDelete = projects.find((project) => project.id === id);
  const updatedProjects = projects.filter((project) => project.id !== id);
  
  // Also delete associated sprints
  const updatedSprints = sprints.filter((sprint) => sprint.projectId !== id);
  
  // Filter out columns that belong to deleted sprints
  const sprintIds = sprints
    .filter((sprint) => sprint.projectId === id)
    .map((sprint) => sprint.id);
  
  const updatedColumns = columns.filter((column) => 
    !column.tasks.some((task) => sprintIds.includes(task.sprintId))
  );

  if (projectToDelete) {
    toast({
      title: "Project deleted",
      description: `${projectToDelete.title} has been deleted.`,
    });
  }

  return { updatedProjects, updatedSprints, updatedColumns };
};
