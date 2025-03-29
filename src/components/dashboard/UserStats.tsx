
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserStatsProps {
  userId: string;
}

interface StatsData {
  totalTasks: number;
  completedTasks: number;
  storyPoints: number;
  completedPoints: number;
}

const UserStats: React.FC<UserStatsProps> = ({ userId }) => {
  const [stats, setStats] = useState<StatsData>({
    totalTasks: 0,
    completedTasks: 0,
    storyPoints: 0,
    completedPoints: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch all tasks assigned to this user
        const { data: assignedTasks, error: assignedError } = await supabase
          .from('tasks')
          .select('id, status, story_points')
          .eq('assign_to', userId);
          
        if (assignedError) throw assignedError;
        
        if (assignedTasks) {
          const completed = assignedTasks.filter(task => task.status === 'done');
          
          const totalPoints = assignedTasks.reduce((sum, task) => 
            sum + (task.story_points || 0), 0);
            
          const completedPoints = completed.reduce((sum, task) => 
            sum + (task.story_points || 0), 0);
          
          setStats({
            totalTasks: assignedTasks.length,
            completedTasks: completed.length,
            storyPoints: totalPoints,
            completedPoints: completedPoints
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  if (loading) {
    return <div className="h-12 flex items-center justify-center">Loading stats...</div>;
  }

  const completionPercentage = stats.totalTasks ? 
    Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const pointsPercentage = stats.storyPoints ?
    Math.round((stats.completedPoints / stats.storyPoints) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-md font-medium mb-2">Task Completion</h3>
        <div className="flex items-center space-x-2">
          <div className="text-3xl font-bold">{stats.completedTasks}</div>
          <div className="text-scrum-text-secondary">of {stats.totalTasks} tasks completed</div>
        </div>
        <div className="mt-2 bg-scrum-border rounded-full h-2 w-full">
          <div 
            className="bg-scrum-accent h-2 rounded-full" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-scrum-text-secondary mt-1">
          {completionPercentage}% complete
        </div>
      </div>
      
      <div>
        <h3 className="text-md font-medium mb-2">Story Points</h3>
        <div className="flex items-center space-x-2">
          <div className="text-3xl font-bold">{stats.completedPoints}</div>
          <div className="text-scrum-text-secondary">of {stats.storyPoints} points achieved</div>
        </div>
        <div className="mt-2 bg-scrum-border rounded-full h-2 w-full">
          <div 
            className="bg-scrum-chart-line-2 h-2 rounded-full" 
            style={{ width: `${pointsPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-scrum-text-secondary mt-1">
          {pointsPercentage}% complete
        </div>
      </div>
    </div>
  );
};

export default UserStats;
