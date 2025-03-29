
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  storyPoints: number;
  project: {
    id: string;
    title: string;
  };
  sprint: {
    id: string;
    title: string;
  } | null;
}

const UserTasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInProgressTasks = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch in-progress tasks with project and sprint details
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            id, title, status, priority, story_points,
            project:project_id (id, title),
            sprint:sprint_id (id, title)
          `)
          .eq('assign_to', user.email)
          .in('status', ['in-progress', 'todo'])
          .order('status', { ascending: false });
          
        if (error) throw error;
        
        // Transform the data to match our Task interface
        const formattedTasks: Task[] = (data || []).map(task => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          storyPoints: task.story_points,
          project: {
            id: task.project ? task.project.id : '',
            title: task.project ? task.project.title : ''
          },
          sprint: task.sprint ? {
            id: task.sprint.id,
            title: task.sprint.title
          } : null
        }));
        
        setTasks(formattedTasks);
      } catch (error) {
        console.error("Error fetching in-progress tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInProgressTasks();
  }, [user]);

  // Function to get priority badge color
  const getPriorityColor = (priority: string): string => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">My Tasks</CardTitle>
        <Clock className="h-5 w-5 text-scrum-accent" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center text-scrum-text-secondary">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="py-4 text-center text-scrum-text-secondary">
            You don't have any in-progress tasks
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{task.title}</span>
                    <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-white`}>
                      {task.priority}
                    </Badge>
                    {task.storyPoints && (
                      <Badge variant="outline">
                        {task.storyPoints} {task.storyPoints === 1 ? 'point' : 'points'}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-scrum-text-secondary mt-1">
                    {task.project.title} {task.sprint && `• ${task.sprint.title}`}
                  </div>
                </div>
                <Link 
                  to={`/projects/${task.project.id}/sprints/${task.sprint?.id}`} 
                  className="flex items-center text-scrum-accent hover:text-scrum-highlight text-sm"
                >
                  <span>View</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTasks;
