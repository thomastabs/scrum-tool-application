
import { v4 as uuidv4 } from "uuid";
import { Project } from "@/types";
import { Toast } from "@/types/toast";

export const createProject = (
  projects: Project[],
  projectData: { title: string; description: string; endGoal: string },
  toast: (props: Toast) => void
): Project[] => {
  const newProject: Project = {
    id: uuidv4(),
    title: projectData.title,
    description: projectData.description,
    endGoal: projectData.endGoal,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const updatedProjects = [...projects, newProject];
  
  toast({
    title: "Project created",
    description: `${projectData.title} has been created successfully.`
  });

  return updatedProjects;
};

export const updateProject = (
  projects: Project[],
  id: string,
  projectData: { title: string; description: string; endGoal: string },
  toast: (props: Toast) => void
): Project[] => {
  const updatedProjects = projects.map(project => 
    project.id === id
      ? { 
          ...project, 
          ...projectData,
          updatedAt: new Date()
        }
      : project
  );
  
  toast({
    title: "Project updated",
    description: `${projectData.title} has been updated successfully.`
  });

  return updatedProjects;
};

export const deleteProject = (
  projects: Project[],
  sprints: any[],
  columns: any[],
  id: string,
  toast: (props: Toast) => void
): { updatedProjects: Project[], updatedSprints: any[], updatedColumns: any[] } => {
  const projectToDelete = projects.find(project => project.id === id);
  
  if (!projectToDelete) {
    return { updatedProjects: projects, updatedSprints: sprints, updatedColumns: columns };
  }
  
  // Get sprints that belong to this project
  const projectSprintIds = sprints
    .filter(sprint => sprint.projectId === id)
    .map(sprint => sprint.id);
  
  // Filter out sprints that belong to this project
  const updatedSprints = sprints.filter(sprint => sprint.projectId !== id);
  
  // Filter out columns that have tasks associated with this project's sprints
  const updatedColumns = columns.filter(column => 
    !column.tasks.some(task => 
      projectSprintIds.includes(task.sprintId)
    )
  );
  
  // Delete the project itself
  const updatedProjects = projects.filter(project => project.id !== id);
  
  toast({
    title: "Project deleted",
    description: `${projectToDelete.title} has been deleted successfully.`
  });

  return { updatedProjects, updatedSprints, updatedColumns };
};
