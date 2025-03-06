
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import SprintForm from "@/components/SprintForm";
import Backlog from "@/components/Backlog";
import SprintTimeline from "@/components/sprint/SprintTimeline";
import { Sprint } from "@/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  LayoutDashboardIcon,
  ListChecksIcon,
  CalendarIcon,
  ArrowLeftIcon,
} from "lucide-react";
import ProjectForm from "@/components/ProjectForm";
import ProjectHeader from "@/components/project/ProjectHeader";
import SprintsList from "@/components/project/SprintsList";
import ProjectNotFound from "@/components/project/ProjectNotFound";
import SprintColumn from "@/components/sprint/SprintColumn";
import SprintHeader from "@/components/sprint/SprintHeader";
import AddColumn from "@/components/sprint/AddColumn";
import TaskForm from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Task } from "@/types";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, sprints, columns, createColumn, deleteColumn, moveTask, completeSprint } = useProject();
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null);
  
  // New state for selected sprint and task form
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

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

  // Functions for sprint board functionality
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setShowTaskForm(true);
  };

  const handleAddTask = (columnId: string) => {
    setActiveColumnId(columnId);
    setTaskToEdit(null);
    setShowTaskForm(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    
    if (data) {
      try {
        const { taskId, sourceColumnId } = JSON.parse(data);
        moveTask(taskId, sourceColumnId, columnId);
      } catch (error) {
        console.error("Error parsing drag data:", error);
      }
    }
  };

  const handleAddColumn = (name: string) => {
    createColumn(name);
  };

  // Check if all tasks are completed for a sprint
  const allTasksCompleted = (sprint: Sprint) => {
    if (!sprint) return false;
    
    const doneColumn = columns.find(column => column.title === "DONE");
    if (!doneColumn) return false;
    
    // Get all columns that have tasks for this sprint
    const sprintColumns = columns.filter(col => 
      col.tasks.some(task => task.sprintId === sprint.id)
    );
    
    // Count total tasks for this sprint
    const totalTasks = sprintColumns.reduce(
      (count, column) => count + column.tasks.filter(task => task.sprintId === sprint.id).length,
      0
    );
    
    // Count tasks in DONE column
    const doneTasks = doneColumn.tasks.filter(task => task.sprintId === sprint.id).length;
    
    // If there are no tasks, sprint can't be completed
    if (totalTasks === 0) return false;
    
    // Check if all tasks are in DONE column
    return doneTasks === totalTasks;
  };

  // Render sprint board if a sprint is selected
  if (selectedSprint) {
    // Only get the ONE instance of each standard column that we need
    const todoColumn = columns.find(column => column.title === "TO DO");
    const inProgressColumn = columns.find(column => column.title === "IN PROGRESS");
    const doneColumn = columns.find(column => column.title === "DONE");

    // Get custom columns that have tasks for this sprint
    const customColumns = columns.filter(column => 
      column.title !== "TO DO" && 
      column.title !== "IN PROGRESS" && 
      column.title !== "DONE" &&
      column.tasks.some(task => task.sprintId === selectedSprint.id)
    );

    // Combine all columns used by this sprint
    const sprintColumns = [
      todoColumn,
      inProgressColumn,
      doneColumn,
      ...customColumns
    ].filter(Boolean) as any[];

    return (
      <div className="container mx-auto py-8 animate-fade-in">
        <Button
          variant="ghost"
          onClick={handleCloseSprintBoard}
          className="mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Project
        </Button>

        <SprintHeader 
          sprint={selectedSprint} 
          canComplete={allTasksCompleted(selectedSprint)} 
          onCompleteSprint={completeSprint} 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {sprintColumns.map((column) => (
            <SprintColumn 
              key={column.id}
              column={column}
              sprintId={selectedSprint.id}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteColumn={deleteColumn}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              isDefaultColumn={
                column.title === "TO DO" || 
                column.title === "IN PROGRESS" || 
                column.title === "DONE"
              }
            />
          ))}

          <AddColumn onAddColumn={handleAddColumn} />
        </div>

        {showTaskForm && activeColumnId && (
          <TaskForm
            onClose={() => {
              setShowTaskForm(false);
              setTaskToEdit(null);
            }}
            sprintId={selectedSprint.id}
            columnId={activeColumnId}
            taskToEdit={taskToEdit}
          />
        )}
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

      <Tabs defaultValue="board">
        <TabsList className="mb-8">
          <TabsTrigger value="board">
            <LayoutDashboardIcon className="h-4 w-4 mr-2" /> Sprints
          </TabsTrigger>
          <TabsTrigger value="backlog">
            <ListChecksIcon className="h-4 w-4 mr-2" /> Product Backlog
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <CalendarIcon className="h-4 w-4 mr-2" /> Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="animate-fade-in">
          <SprintsList 
            sprints={projectSprints}
            projectId={project.id}
            onCreateSprint={() => setShowSprintForm(true)}
            onEditSprint={handleEditSprint}
            onViewSprint={handleViewSprintBoard}
          />
        </TabsContent>

        <TabsContent value="backlog" className="animate-fade-in">
          <Backlog projectId={project.id} />
        </TabsContent>

        <TabsContent value="timeline" className="animate-fade-in">
          <SprintTimeline 
            sprints={projectSprints} 
            onCreateSprint={() => setShowSprintForm(true)} 
          />
        </TabsContent>
      </Tabs>

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
