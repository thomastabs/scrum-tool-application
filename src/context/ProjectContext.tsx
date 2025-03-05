import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Project, Sprint, Column, Task, BacklogItem, ProjectFormData, SprintFormData, TaskFormData, BacklogItemFormData, Collaborator, CollaboratorFormData } from "@/types";
import { useProjects } from "@/hooks/useProjects";
import { useSprints } from "@/hooks/useSprints";
import { useColumns } from "@/hooks/useColumns";
import { useTasks } from "@/hooks/useTasks";
import { useBacklog } from "@/hooks/useBacklog";

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  sprints: Sprint[];
  columns: Column[];
  backlogItems: BacklogItem[];
  isLoading: boolean;
  createProject: (data: ProjectFormData) => Promise<void>;
  updateProject: (id: string, data: ProjectFormData) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (id: string) => void;
  createSprint: (data: SprintFormData) => Promise<void>;
  updateSprint: (id: string, data: SprintFormData) => Promise<void>;
  completeSprint: (id: string) => Promise<void>;
  createColumn: (sprintId: string, title: string) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  createTask: (sprintId: string, columnId: string, data: TaskFormData) => Promise<void>;
  updateTask: (id: string, data: TaskFormData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string) => Promise<void>;
  createBacklogItem: (data: BacklogItemFormData) => Promise<void>;
  updateBacklogItem: (id: string, data: BacklogItemFormData) => Promise<void>;
  deleteBacklogItem: (id: string) => Promise<void>;
  moveBacklogItemToSprint: (backlogItemId: string, sprintId: string) => Promise<void>;
  inviteCollaborator: (projectId: string, projectTitle: string, data: CollaboratorFormData) => Promise<{success: boolean, error: string | null}>;
  removeCollaborator: (id: string) => Promise<void>;
  getProjectCollaborators: (projectId: string) => Collaborator[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  
  const {
    selectedProject,
    createProject: createProjectFn,
    updateProject: updateProjectFn,
    deleteProject: deleteProjectFn,
    selectProject: selectProjectFn
  } = useProjects();
  
  const {
    createSprint: createSprintFn,
    updateSprint: updateSprintFn,
    completeSprint: completeSprintFn
  } = useSprints();
  
  const {
    createColumn: createColumnFn,
    deleteColumn: deleteColumnFn
  } = useColumns();
  
  const {
    createTask: createTaskFn,
    updateTask: updateTaskFn,
    deleteTask: deleteTaskFn,
    moveTask: moveTaskFn
  } = useTasks();
  
  const {
    createBacklogItem: createBacklogItemFn,
    updateBacklogItem: updateBacklogItemFn,
    deleteBacklogItem: deleteBacklogItemFn,
    moveBacklogItemToSprint: moveBacklogItemToSprintFn
  } = useBacklog();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUser();

    const { data: authData } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        selectProjectFn("", []);
      }
    });

    return () => {
      authData.subscription.unsubscribe();
    };
  }, []);

  const fetchProjects = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error fetching projects",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
    
    return data.map(project => ({
      ...project,
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at)
    }));
  };

  const fetchSprints = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error fetching sprints",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
    
    return data.map(sprint => ({
      ...sprint,
      projectId: sprint.project_id,
      startDate: new Date(sprint.start_date),
      endDate: new Date(sprint.end_date),
      isCompleted: sprint.is_completed,
      createdAt: new Date(sprint.created_at),
      updatedAt: new Date(sprint.updated_at)
    }));
  };

  const fetchColumns = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error fetching columns",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
    
    return data.map(column => ({
      ...column,
      createdAt: new Date(column.created_at),
      updatedAt: new Date(column.updated_at),
      tasks: []
    }));
  };

  const fetchTasks = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
    
    return data.map(task => ({
      ...task,
      sprintId: task.sprint_id,
      columnId: task.column_id,
      storyPoints: task.story_points,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at)
    }));
  };

  const fetchBacklogItems = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('backlog_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error fetching backlog items",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
    
    return data.map(item => ({
      ...item,
      projectId: item.project_id,
      storyPoints: item.story_points,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  };

  const {
    data: projects = [],
    isLoading: isProjectsLoading
  } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    enabled: !!user
  });

  const {
    data: sprints = [],
    isLoading: isSprintsLoading
  } = useQuery({
    queryKey: ['sprints'],
    queryFn: fetchSprints,
    enabled: !!user
  });

  const {
    data: columnsData = [],
    isLoading: isColumnsLoading
  } = useQuery({
    queryKey: ['columns'],
    queryFn: fetchColumns,
    enabled: !!user
  });

  const {
    data: tasks = [],
    isLoading: isTasksLoading
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    enabled: !!user
  });

  const {
    data: backlogItems = [],
    isLoading: isBacklogItemsLoading
  } = useQuery({
    queryKey: ['backlogItems'],
    queryFn: fetchBacklogItems,
    enabled: !!user
  });

  const columns = columnsData.map(column => ({
    ...column,
    tasks: tasks.filter(task => task.columnId === column.id)
  }));

  const isLoading = isProjectsLoading || isSprintsLoading || isColumnsLoading || isTasksLoading || isBacklogItemsLoading;

  useEffect(() => {
    const createDefaultColumns = async () => {
      if (!user || isLoading) return;
      
      const defaultColumns = ["TO DO", "IN PROGRESS", "DONE"];
      const existingColumnTitles = columns.map(col => col.title);
      
      for (const title of defaultColumns) {
        if (!existingColumnTitles.includes(title)) {
          await createColumnFn("", title);
        }
      }
    };
    
    createDefaultColumns();
  }, [user, isLoading, columns]);

  const createProject = async (data: ProjectFormData) => {
    await createProjectFn(data);
  };

  const updateProject = async (id: string, data: ProjectFormData) => {
    await updateProjectFn(id, data);
  };

  const deleteProject = async (id: string) => {
    await deleteProjectFn(id);
  };

  const selectProject = (id: string) => {
    selectProjectFn(id, projects);
  };

  const createSprint = async (data: SprintFormData) => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    await createSprintFn(selectedProject.id, data);
  };

  const updateSprint = async (id: string, data: SprintFormData) => {
    await updateSprintFn(id, data);
  };

  const completeSprint = async (id: string) => {
    await completeSprintFn(id);
  };

  const createColumn = async (sprintId: string, title: string) => {
    await createColumnFn(sprintId, title);
  };

  const deleteColumn = async (id: string) => {
    await deleteColumnFn(id);
  };

  const createTask = async (sprintId: string, columnId: string, data: TaskFormData) => {
    await createTaskFn(sprintId, columnId, data);
  };

  const updateTask = async (id: string, data: TaskFormData) => {
    await updateTaskFn(id, data);
  };

  const deleteTask = async (id: string) => {
    await deleteTaskFn(id);
  };

  const moveTask = async (taskId: string, sourceColumnId: string, destinationColumnId: string) => {
    await moveTaskFn(taskId, sourceColumnId, destinationColumnId);
  };

  const createBacklogItem = async (data: BacklogItemFormData) => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive"
      });
      return;
    }
    
    await createBacklogItemFn(selectedProject.id, data);
  };

  const updateBacklogItem = async (id: string, data: BacklogItemFormData) => {
    await updateBacklogItemFn(id, data);
  };

  const deleteBacklogItem = async (id: string) => {
    await deleteBacklogItemFn(id);
  };

  const moveBacklogItemToSprint = async (backlogItemId: string, sprintId: string) => {
    await moveBacklogItemToSprintFn(backlogItemId, sprintId);
  };

  // Collaborator implementation stubs
  const inviteCollaborator = async (projectId: string, projectTitle: string, data: CollaboratorFormData) => {
    console.log(`Inviting ${data.email} as ${data.role} to project ${projectTitle}`);
    // Placeholder implementation
    return { success: true, error: null };
  };

  const removeCollaborator = async (id: string) => {
    console.log(`Removing collaborator ${id}`);
    // Placeholder implementation
  };

  const getProjectCollaborators = (projectId: string) => {
    // Placeholder implementation
    return [];
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        sprints,
        columns,
        backlogItems,
        isLoading,
        createProject,
        updateProject,
        deleteProject,
        selectProject,
        createSprint,
        updateSprint,
        completeSprint,
        createColumn,
        deleteColumn,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        createBacklogItem,
        updateBacklogItem,
        deleteBacklogItem,
        moveBacklogItemToSprint,
        inviteCollaborator,
        removeCollaborator,
        getProjectCollaborators
      }}
    >
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
