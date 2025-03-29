
import React, { useState, useEffect } from 'react';
import { Clock, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase, withRetry } from "@/lib/supabase";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface TaskWithProject {
  id: string;
  title: string;
  project_id: string;
  project_title: string;
  status: string;
  sprint_id: string | null;
  story_points: number | null;
  priority: string | null;
}

const UserTasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch in-progress tasks assigned to the user
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
        
        // Transform the data to match our TaskWithProject interface
        const transformedTasks = data.map((task: any) => ({
          id: task.id,
          title: task.title,
          project_id: task.project_id,
          project_title: task.projects?.title || 'Unknown Project',
          status: task.status,
          sprint_id: task.sprint_id,
          story_points: task.story_points,
          priority: task.priority
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

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-sm text-gray-500 animate-pulse">Loading tasks...</p>
          </div>
        ) : tasks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} className="cursor-pointer hover:bg-muted/80">
                  <TableCell 
                    className="font-medium"
                    onClick={() => navigateToTask(task.project_id, task.sprint_id)}
                  >
                    {task.title}
                  </TableCell>
                  <TableCell>{task.project_title}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    {task.priority ? (
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>{task.story_points || '-'}</TableCell>
                  <TableCell>
                    <button 
                      onClick={() => navigateToTask(task.project_id, task.sprint_id)}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
