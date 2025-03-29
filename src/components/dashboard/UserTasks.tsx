
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

interface UserTasksProps {
  userId: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  story_points: number | null;
  project: {
    id: string;
    title: string;
  };
  sprint: {
    id: string;
    title: string;
  } | null;
}

const UserTasks: React.FC<UserTasksProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // Fetch in-progress tasks assigned to this user
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            id, 
            title, 
            status, 
            priority, 
            story_points,
            project:project_id (id, title),
            sprint:sprint_id (id, title)
          `)
          .eq('assign_to', userId)
          .not('status', 'eq', 'done')
          .not('status', 'eq', 'backlog')
          .order('priority', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          setTasks(data as Task[]);
        }
      } catch (error) {
        console.error("Error fetching user tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Low</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="h-20 flex items-center justify-center">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 bg-scrum-background rounded-lg">
        <p className="text-scrum-text-secondary">You have no in-progress tasks assigned.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-scrum-border">
              <th className="px-4 py-2 text-left text-sm font-medium text-scrum-text-secondary">Task</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-scrum-text-secondary">Project</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-scrum-text-secondary">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-scrum-text-secondary">Priority</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-scrum-text-secondary">Points</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-scrum-background border-b border-scrum-border">
                <td className="px-4 py-3">
                  <Link 
                    to={`/projects/${task.project.id}/sprints/${task.sprint?.id}`} 
                    className="text-scrum-accent hover:underline"
                  >
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link 
                    to={`/projects/${task.project.id}`}
                    className="text-scrum-text-secondary hover:underline"
                  >
                    {task.project.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs rounded-full bg-scrum-accent bg-opacity-10 text-scrum-accent">
                    {task.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {getPriorityBadge(task.priority)}
                </td>
                <td className="px-4 py-3 text-sm text-scrum-text-secondary">
                  {task.story_points || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTasks;
