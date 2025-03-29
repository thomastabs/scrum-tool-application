
import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase, withRetry } from "@/lib/supabase";

interface UserStatsData {
  totalStoryPoints: number;
  completedTasks: number;
}

const UserStats: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStatsData>({
    totalStoryPoints: 0,
    completedTasks: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch completed tasks count and sum of story points
        const { data, error } = await withRetry(async () => {
          return await supabase
            .from('tasks')
            .select('story_points')
            .eq('user_id', user.id)
            .eq('status', 'done');
        });
        
        if (error) throw error;
        
        const totalStoryPoints = data?.reduce((sum, task) => 
          sum + (task.story_points || 0), 0
        ) || 0;
        
        const completedTasks = data?.length || 0;
        
        setStats({
          totalStoryPoints,
          completedTasks
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Story Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-16 flex items-center justify-center">
              <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-3xl font-bold">{stats.totalStoryPoints}</span>
              <p className="text-sm text-gray-500 mt-1">Points completed</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            Tasks Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-16 flex items-center justify-center">
              <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-3xl font-bold">{stats.completedTasks}</span>
              <p className="text-sm text-gray-500 mt-1">Tasks finished</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStats;
