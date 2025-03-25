import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { fetchProjectCollaborators, fetchProjectSprints, fetchCollaborativeSprintTasks } from "@/lib/supabase";
import { Users, Mail, ChevronLeft, ChevronRight, CheckCircle, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { Collaborator, Task } from "@/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Cache storage for collaborators data
const collaboratorsCache = new Map();

// Page size for collaborators pagination
const PAGE_SIZE = 5;

const ProjectTeam: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject } = useProjects();
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [owner, setOwner] = useState<{id: string, username: string, email?: string} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [taskData, setTaskData] = useState<Record<string, TaskStats>>({});
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  const project = getProject(projectId || "");
  
  interface TaskStats {
    currentAssigned: number;
    completedTasks: number;
    currentPoints: number;
    totalPoints: number;
    assignedTasks: Task[];
  }
  
  useEffect(() => {
    const loadCollaborators = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      try {
        // Check cache first before making API call
        const cacheKey = `collaborators-${projectId}`;
        if (collaboratorsCache.has(cacheKey)) {
          console.log('Using cached collaborators data');
          setCollaborators(collaboratorsCache.get(cacheKey));
        } else {
          // Get collaborators - with optimized field selection
          const collaboratorsData = await fetchProjectCollaborators(projectId);
          setCollaborators(collaboratorsData);
          
          // Store in cache with a 5-minute expiry
          collaboratorsCache.set(cacheKey, collaboratorsData);
          setTimeout(() => {
            collaboratorsCache.delete(cacheKey);
          }, 5 * 60 * 1000); // 5 minutes
        }
        
        // Set owner data if available from project
        if (project?.ownerId && project?.ownerName) {
          setOwner({
            id: project.ownerId,
            username: project.ownerName,
            email: undefined
          });
        }
      } catch (error) {
        console.error("Error loading team data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCollaborators();
    loadTaskStatistics();
  }, [projectId, project]);
  
  const loadTaskStatistics = async () => {
    if (!projectId) return;
    
    setLoadingTasks(true);
    try {
      // Fetch all sprints for the project
      const sprints = await fetchProjectSprints(projectId);
      
      // Determine which sprints are active
      const now = new Date();
      const activeSprintIds = sprints
        .filter(sprint => {
          const startDate = new Date(sprint.start_date);
          const endDate = new Date(sprint.end_date);
          return startDate <= now && endDate >= now;
        })
        .map(sprint => sprint.id);
      
      // Fetch tasks for all sprints
      const allTasks: Task[] = [];
      for (const sprint of sprints) {
        const sprintTasksRaw = await fetchCollaborativeSprintTasks(sprint.id);
        
        // Transform the snake_case API response to match our Task type
        const transformedTasks = sprintTasksRaw.map(rawTask => {
          return {
            id: rawTask.id,
            title: rawTask.title,
            description: rawTask.description || '',
            sprintId: rawTask.sprint_id,
            status: rawTask.status,
            assignedTo: rawTask.assign_to,
            storyPoints: rawTask.story_points,
            createdAt: new Date().toISOString(), // Default value as it's required by type
            updatedAt: new Date().toISOString(), // Default value as it's required by type
            completionDate: rawTask.completion_date,
            // Keep the original fields as well for compatibility
            story_points: rawTask.story_points,
            assign_to: rawTask.assign_to,
            sprint_id: rawTask.sprint_id,
            completion_date: rawTask.completion_date
          } as Task;
        });
        
        allTasks.push(...transformedTasks);
      }
      
      // Create a map of all collaborators and the owner
      const allMembers = new Map<string, string>();
      collaborators.forEach(collab => allMembers.set(collab.userId, collab.username));
      if (owner) allMembers.set(owner.id, owner.username);
      
      // Calculate statistics for each team member
      const stats: Record<string, TaskStats> = {};
      
      allMembers.forEach((username, userId) => {
        const userTasks = allTasks.filter(task => task.assign_to === userId || task.assignedTo === userId);
        
        // Handle both formats for sprint ID
        const isActiveTask = (task: Task) => {
          const sprintIdValue = task.sprint_id || task.sprintId;
          return activeSprintIds.includes(sprintIdValue || '');
        };
        const isCompletedTask = (task: Task) => task.status === 'done';
        
        stats[userId] = {
          currentAssigned: userTasks.filter(task => isActiveTask(task) && !isCompletedTask(task)).length,
          completedTasks: userTasks.filter(isCompletedTask).length,
          currentPoints: userTasks
            .filter(task => isActiveTask(task))
            .reduce((sum, task) => sum + (task.story_points || task.storyPoints || 0), 0),
          totalPoints: userTasks
            .reduce((sum, task) => sum + (task.story_points || task.storyPoints || 0), 0),
          assignedTasks: userTasks.filter(task => !isCompletedTask(task)),
        };
      });
      
      setTaskData(stats);
    } catch (error) {
      console.error("Error loading task statistics:", error);
    } finally {
      setLoadingTasks(false);
    }
  };
  
  const toggleUserExpand = (userId: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">Loading team information...</div>
      </div>
    );
  }
  
  const totalPages = Math.ceil(collaborators.length / PAGE_SIZE);
  const paginatedCollaborators = collaborators.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const getRoleBadgeClass = (role: string) => {
    switch(role) {
      case 'scrum_master':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case 'product_owner':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case 'team_member':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-400";
    }
  };
  
  const renderPaginationLinks = () => {
    const links = [];
    
    for (let i = 1; i <= totalPages; i++) {
      links.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return links;
  };
  
  // Format date to be more readable
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };
  
  const renderTaskStats = (userId: string) => {
    const stats = taskData[userId];
    if (!stats) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          Active: {stats.currentAssigned}
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
          Completed: {stats.completedTasks}
        </Badge>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
          Points: {stats.currentPoints}/{stats.totalPoints}
        </Badge>
      </div>
    );
  };
  
  const renderTaskDropdown = (userId: string) => {
    const isExpanded = expandedUsers[userId] || false;
    const stats = taskData[userId];
    
    if (!stats || stats.assignedTasks.length === 0) {
      return (
        <div className="text-xs text-muted-foreground mt-1">
          No active tasks
        </div>
      );
    }
    
    return (
      <div className="mt-2">
        <button 
          onClick={() => toggleUserExpand(userId)} 
          className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isExpanded ? (
            <>Hide tasks <ChevronUp className="h-3 w-3 ml-1" /></>
          ) : (
            <>Show tasks ({stats.assignedTasks.length}) <ChevronDown className="h-3 w-3 ml-1" /></>
          )}
        </button>
        
        {isExpanded && (
          <div className="mt-2 bg-accent/10 rounded-md p-2 space-y-2 max-h-40 overflow-y-auto">
            {stats.assignedTasks.map(task => (
              <div key={task.id} className="text-xs">
                <div className="flex items-center gap-1">
                  {task.status === 'done' ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Circle className="h-3 w-3 text-gray-400" />
                  )}
                  <span className="font-medium">{task.title}</span>
                </div>
                <div className="pl-4 text-muted-foreground">
                  Status: {task.status} • {task.storyPoints || task.story_points || 0} points
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Team</h2>
      
      <div className="space-y-4">
        <div className="scrum-card p-6">
          <h3 className="text-lg font-semibold mb-4">Project Owner</h3>
          {owner ? (
            <div className="flex items-center gap-3 p-3 bg-background rounded-md border border-border">
              <div className="h-10 w-10 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold">{owner.username.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium">{owner.username}</div>
                {owner.email && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    <span>{owner.email}</span>
                  </div>
                )}
                <div className="text-xs px-2 py-1 rounded-full inline-block bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 mt-1">
                  Owner
                </div>
                
                {loadingTasks ? (
                  <div className="text-xs mt-2 animate-pulse">Loading task statistics...</div>
                ) : (
                  <>
                    {renderTaskStats(owner.id)}
                    {renderTaskDropdown(owner.id)}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">Owner information not available</div>
          )}
        </div>
        
        <div className="scrum-card p-6">
          <h3 className="text-lg font-semibold mb-4">Team Members</h3>
          {collaborators.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCollaborators.map(collab => (
                    <TableRow key={collab.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-accent/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold">{collab.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <span>{collab.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block ${getRoleBadgeClass(collab.role)}`}>
                          {collab.role === 'scrum_master' ? 'Scrum Master' : 
                           collab.role === 'product_owner' ? 'Product Owner' : 
                           'Team Member'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {loadingTasks ? (
                          <div className="text-xs animate-pulse">Loading stats...</div>
                        ) : (
                          <>
                            {renderTaskStats(collab.userId)}
                            {renderTaskDropdown(collab.userId)}
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        {collab.email && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{collab.email}</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                        </PaginationItem>
                      )}
                      
                      {renderPaginationLinks()}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-muted-foreground">No team members yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectTeam;
