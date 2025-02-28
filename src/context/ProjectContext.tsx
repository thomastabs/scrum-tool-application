
import React, { createContext, useState, useContext, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Project, Sprint, Column, BacklogItem } from "@/types";
import { ProjectContextType } from "./ProjectContextTypes";

// Import action creators
import { createProject, updateProject, deleteProject } from "./actions/projectActions";
import { createSprint, updateSprint, deleteSprint, completeSprint } from "./actions/sprintActions";
import { createColumn, deleteColumn } from "./actions/columnActions";
import { createTask, updateTask, deleteTask, moveTask } from "./actions/taskActions";
import { createBacklogItem, updateBacklogItem, deleteBacklogItem, moveToSprint } from "./actions/backlogActions";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedProjects = localStorage.getItem("projects");
    const storedSprints = localStorage.getItem("sprints");
    const storedColumns = localStorage.getItem("columns");
    const storedBacklogItems = localStorage.getItem("backlogItems");

    if (storedProjects) setProjects(JSON.parse(storedProjects));
    if (storedSprints) setSprints(JSON.parse(storedSprints));
    if (storedColumns) setColumns(JSON.parse(storedColumns));
    if (storedBacklogItems) setBacklogItems(JSON.parse(storedBacklogItems));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("sprints", JSON.stringify(sprints));
  }, [sprints]);

  useEffect(() => {
    localStorage.setItem("columns", JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem("backlogItems", JSON.stringify(backlogItems));
  }, [backlogItems]);

  // Project handlers
  const handleCreateProject = (projectData: { title: string; description: string; endGoal: string }) => {
    setProjects(prevProjects => createProject(prevProjects, projectData, toast));
  };

  const handleUpdateProject = (id: string, projectData: { title: string; description: string; endGoal: string }) => {
    setProjects(prevProjects => updateProject(prevProjects, id, projectData, toast));
  };

  const handleDeleteProject = (id: string) => {
    const { updatedProjects, updatedSprints, updatedColumns } = deleteProject(projects, sprints, columns, id, toast);
    setProjects(updatedProjects);
    setSprints(updatedSprints);
    setColumns(updatedColumns);
  };

  // Sprint handlers
  const handleCreateSprint = (sprintData: { title: string; description: string; startDate: Date; endDate: Date; projectId: string }) => {
    const newSprint = createSprint(sprints, sprintData, toast);
    setSprints(prevSprints => [...prevSprints, newSprint]);
  };

  const handleUpdateSprint = (id: string, sprintData: { title: string; description: string; startDate: Date; endDate: Date }) => {
    setSprints(prevSprints => updateSprint(prevSprints, id, sprintData, toast));
  };

  const handleDeleteSprint = (id: string) => {
    const { updatedSprints, updatedColumns } = deleteSprint(sprints, columns, id, toast);
    setSprints(updatedSprints);
    setColumns(updatedColumns);
  };

  const handleCompleteSprint = (id: string) => {
    setSprints(prevSprints => completeSprint(prevSprints, id, toast));
  };

  // Column handlers
  const handleCreateColumn = (sprintId: string, title: string) => {
    setColumns(prevColumns => createColumn(prevColumns, sprintId, title, toast));
  };

  const handleDeleteColumn = (id: string) => {
    setColumns(prevColumns => deleteColumn(prevColumns, id, toast));
  };

  // Task handlers
  const handleCreateTask = (sprintId: string, columnId: string, taskData: { title: string; description: string; priority: "low" | "medium" | "high"; assignee: string; storyPoints: number }) => {
    setColumns(prevColumns => createTask(prevColumns, sprintId, columnId, taskData, toast));
  };

  const handleUpdateTask = (id: string, taskData: { title: string; description: string; priority: "low" | "medium" | "high"; assignee: string; storyPoints: number }) => {
    setColumns(prevColumns => updateTask(prevColumns, id, taskData, toast));
  };

  const handleDeleteTask = (id: string) => {
    setColumns(prevColumns => deleteTask(prevColumns, id, toast));
  };

  const handleMoveTask = (taskId: string, sourceColumnId: string, destinationColumnId: string) => {
    setColumns(prevColumns => moveTask(prevColumns, taskId, sourceColumnId, destinationColumnId));
  };

  // Backlog item handlers
  const handleCreateBacklogItem = (itemData: { title: string; description: string; priority: "low" | "medium" | "high"; storyPoints: number; projectId: string }) => {
    setBacklogItems(prevItems => createBacklogItem(prevItems, itemData, toast));
  };

  const handleUpdateBacklogItem = (id: string, itemData: { title: string; description: string; priority: "low" | "medium" | "high"; storyPoints: number }) => {
    setBacklogItems(prevItems => updateBacklogItem(prevItems, id, itemData, toast));
  };

  const handleDeleteBacklogItem = (id: string) => {
    setBacklogItems(prevItems => deleteBacklogItem(prevItems, id, toast));
  };

  const handleMoveToSprint = (itemId: string, sprintId: string) => {
    const { updatedBacklogItems, updatedColumns } = moveToSprint(backlogItems, columns, itemId, sprintId, toast);
    setBacklogItems(updatedBacklogItems);
    setColumns(updatedColumns);
  };

  // Create context value object with all handlers
  const contextValue: ProjectContextType = {
    projects,
    sprints,
    columns,
    backlogItems,
    createProject: handleCreateProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject,
    createSprint: handleCreateSprint,
    updateSprint: handleUpdateSprint,
    deleteSprint: handleDeleteSprint,
    completeSprint: handleCompleteSprint,
    createColumn: handleCreateColumn,
    deleteColumn: handleDeleteColumn,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    moveTask: handleMoveTask,
    createBacklogItem: handleCreateBacklogItem,
    updateBacklogItem: handleUpdateBacklogItem,
    deleteBacklogItem: handleDeleteBacklogItem,
    moveToSprint: handleMoveToSprint,
    moveBacklogItemToSprint: handleMoveToSprint // Alias for compatibility
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
