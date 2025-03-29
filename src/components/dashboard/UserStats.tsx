
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface StatsData {
  completedTasks: number;
  storyPoints: number;
}

const UserStats: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData>({ completedTasks: 0, storyPoints: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch completed tasks and their story points
        const { data, error } = await supabase
          .from('tasks')
          .select('id, story_points')
          .eq('user_id', user.id)
          .eq('status', 'done');
          
        if (error) throw error;
        
        // Calculate stats
        const completedCount = data?.length || 0;
        const totalPoints = data?.reduce((sum, task) => sum + (task.story_points || 0), 0) || 0;
        
        setStats({
          completedTasks: completedCount,
          storyPoints: totalPoints
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          <CheckCircle className="h-4 w-4 text-scrum-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : stats.completedTasks}
          </div>
          <p className="text-xs text-scrum-text-secondary">
            Tasks marked as done across all projects
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Story Points</CardTitle>
          <Award className="h-4 w-4 text-scrum-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : stats.storyPoints}
          </div>
          <p className="text-xs text-scrum-text-secondary">
            Total points from completed tasks
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStats;
