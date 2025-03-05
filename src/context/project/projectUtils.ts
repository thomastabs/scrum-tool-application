
import { Project, Sprint, Column } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Importing supabase functionality
// import { 
//   createProjectInDB,
//   getProjectsFromDB,
//   updateProjectInDB,
//   deleteProjectFromDB
// } from "@/lib/supabase";

// Create a new project
export const createProjectLocal = (
  projects: Project[],
  data: { title: string; description: string; endGoal: string },
  userId: string
): Project => {
  const newProject: Project = {
    id: uuidv4(),
    title: data.title,
    description: data.description,
    endGoal: data.endGoal,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return newProject;
};

// Update a project
export const updateProjectLocal = (
  projects: Project[],
  id: string,
  data: { title: string; description: string; endGoal: string }
): Project[] => {
  return projects.map(project =>
    project.id === id
      ? {
          ...project,
          title: data.title,
          description: data.description,
          endGoal: data.endGoal,
          updatedAt: new Date()
        }
      : project
  );
};

// Delete a project and related resources
export const deleteProjectLocal = (
  projects: Project[],
  sprints: Sprint[],
  columns: Column[],
  id: string
): { updatedProjects: Project[], updatedSprints: Sprint[], updatedColumns: Column[] } => {
  // Remove the project
  const updatedProjects = projects.filter(project => project.id !== id);
  
  // Get IDs of sprints related to this project
  const relatedSprintIds = sprints
    .filter(sprint => sprint.projectId === id)
    .map(sprint => sprint.id);
  
  // Remove related sprints
  const updatedSprints = sprints.filter(sprint => sprint.projectId !== id);
  
  // Remove columns with tasks related to these sprints
  const updatedColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => !relatedSprintIds.includes(task.sprintId))
  }));
  
  return { updatedProjects, updatedSprints, updatedColumns };
};
