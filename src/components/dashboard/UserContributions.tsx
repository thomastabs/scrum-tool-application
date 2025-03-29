
import React, { useState, useEffect } from 'react';
import { Calendar, CalendarX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase, withRetry } from "@/lib/supabase";

interface ContributionDay {
  date: string;
  count: number;
}

const UserContributions: React.FC = () => {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContributions = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get the date 90 days ago
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        // First, let's get all the completed tasks
        const { data, error } = await withRetry(async () => {
          return await supabase
            .from('tasks')
            .select('completion_date')
            .eq('user_id', user.id)
            .not('completion_date', 'is', null)
            .gte('completion_date', startDateStr);
        });
        
        if (error) throw error;
        
        // Now manually count contributions per day
        const contributionsMap = new Map<string, number>();
        
        data?.forEach(task => {
          if (task.completion_date) {
            const date = task.completion_date as string;
            contributionsMap.set(date, (contributionsMap.get(date) || 0) + 1);
          }
        });
        
        // Convert the map to our ContributionDay array
        const contributionData: ContributionDay[] = Array.from(contributionsMap.entries())
          .map(([date, count]) => ({
            date,
            count
          }));
        
        setContributions(contributionData);
      } catch (error) {
        console.error('Error fetching user contributions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContributions();
  }, [user]);

  // Generate empty contribution cells for days with no contributions
  const generateContributionGrid = () => {
    const days = 91; // Show last 90 days + today
    const today = new Date();
    const cells = [];
    
    const contributionMap = new Map<string, number>();
    contributions.forEach(contrib => {
      contributionMap.set(contrib.date, contrib.count);
    });
    
    for (let i = days - 1; i >= 0; i--) {
      const cellDate = new Date(today);
      cellDate.setDate(today.getDate() - i);
      const dateString = cellDate.toISOString().split('T')[0];
      
      const count = contributionMap.get(dateString) || 0;
      let intensityClass = 'bg-gray-200 dark:bg-gray-800';
      
      if (count > 0) {
        if (count >= 5) {
          intensityClass = 'bg-green-700 dark:bg-green-600';
        } else if (count >= 3) {
          intensityClass = 'bg-green-500 dark:bg-green-500';
        } else {
          intensityClass = 'bg-green-300 dark:bg-green-700';
        }
      }
      
      cells.push(
        <div 
          key={dateString}
          className={`w-3 h-3 rounded-sm ${intensityClass}`}
          title={`${dateString}: ${count} contribution(s)`}
        />
      );
    }
    
    return cells;
  };

  return (
    <Card className="border border-border bg-card dark:bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center text-card-foreground dark:text-card-foreground">
          <Calendar className="mr-2 h-5 w-5" />
          Contribution Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading contributions...</p>
          </div>
        ) : contributions.length > 0 ? (
          <div className="grid grid-cols-13 gap-1">
            {generateContributionGrid()}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CalendarX className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No contributions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserContributions;
