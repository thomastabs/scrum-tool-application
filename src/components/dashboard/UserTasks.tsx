
import React, { useState, useEffect } from 'react';
import { Clock, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase, withRetry } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "@/types";

// Define an extended Task interface that includes projectTitle
interface ExtendedTask extends Task {
  projectTitle?: string;
}

const UserTasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await withRetry(async () => {
          return await supabase
            .from('tasks')
            .select(`
              id, 
              title, 
              status, 
              project_id, 
              sprint_id,
              story_points,
              priority,
              projects:project_id (title)
            `)
            .eq('assign_to', user.username)
            .neq('status', 'done')
            .order('status', { ascending: true });
        });
        
        if (error) throw error;
        
        // Safely transform the data
        const transformedTasks: ExtendedTask[] = (data || []).map((task: any) => ({
          id: task.id,
          title: task.title,
          projectId: task.project_id,
          projectTitle: task.projects?.title || 'Unknown Project',
          status: task.status,
          sprintId: task.sprint_id,
          storyPoints: task.story_points,
          priority: task.priority as Task['priority'],
          description: task.description || '',
          assignedTo: task.assign_to || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        setTasks(transformedTasks);
      } catch (error) {
        console.error('Error fetching user tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserTasks();
  }, [user]);

  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in progress':
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
      case 'todo':
        return <Badge variant="outline">To Do</Badge>;
      case 'ready':
        return <Badge variant="default" className="bg-amber-500">Ready</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Blocked</Badge>;
      case 'backlog':
        return <Badge variant="secondary">Backlog</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const navigateToTask = (projectId: string, sprintId: string | null) => {
    if (sprintId) {
      navigate(`/projects/${projectId}/sprint/${sprintId}`);
    } else {
      navigate(`/projects/${projectId}/backlog`);
    }
  };

  const TasksSkeleton = () => (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-4 py-3">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-5 w-1/5" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-6" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      ))}
    </div>
  );

  return (
    <Card className="mt-4 bg-scrum-card border border-scrum-border transition-all duration-300 hover:shadow-lg hover:scale-[1.01] hover:bg-scrum-card/80">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4"> {/* Added pt-4 for more vertical spacing */}
        {isLoading ? (
          <div className="space-y-3">
            <TasksSkeleton />
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => navigateToTask(task.projectId, task.sprintId)}
                className="border border-scrum-border rounded-md p-4 cursor-pointer hover:bg-scrum-background/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm line-clamp-1">{task.title}</h4>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToTask(task.projectId, task.sprintId);
                    }}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ml-2"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <div className="text-xs text-scrum-text-secondary mb-2">{task.projectTitle}</div>
                
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {getStatusBadge(task.status)}
                  
                  {task.priority && (
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  )}
                  
                  {task.storyPoints && (
                    <Badge variant="outline" className="ml-auto">
                      {task.storyPoints} {task.storyPoints === 1 ? 'point' : 'points'}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No tasks in progress</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTasks;
