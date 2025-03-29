
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ContributionDay {
  date: string;
  count: number;
}

interface UserContributionsProps {
  userId: string;
}

const UserContributions: React.FC<UserContributionsProps> = ({ userId }) => {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true);
        
        // Get all completed tasks for this user in the last 365 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 365);
        
        const { data, error } = await supabase
          .from('tasks')
          .select('completion_date')
          .eq('assign_to', userId)
          .eq('status', 'done')
          .gte('completion_date', startDate.toISOString().split('T')[0])
          .lte('completion_date', endDate.toISOString().split('T')[0]);
          
        if (error) throw error;
        
        // Count contributions by date
        const contributionMap = new Map<string, number>();
        
        // Initialize the map with dates from the past year
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          contributionMap.set(dateStr, 0);
        }
        
        // Count tasks completed on each date
        if (data) {
          data.forEach(task => {
            if (task.completion_date) {
              const dateStr = task.completion_date;
              const currentCount = contributionMap.get(dateStr) || 0;
              contributionMap.set(dateStr, currentCount + 1);
            }
          });
        }
        
        // Convert map to array of objects
        const contributionArray: ContributionDay[] = Array.from(contributionMap).map(
          ([date, count]) => ({ date, count })
        ).sort((a, b) => a.date.localeCompare(b.date));
        
        setContributions(contributionArray);
      } catch (error) {
        console.error("Error fetching contributions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchContributions();
    }
  }, [userId]);

  if (loading) {
    return <div className="h-20 flex items-center justify-center">Loading contribution data...</div>;
  }

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-scrum-card";
    if (count < 2) return "bg-scrum-chart-line-1 bg-opacity-30";
    if (count < 4) return "bg-scrum-chart-line-1 bg-opacity-50";
    if (count < 6) return "bg-scrum-chart-line-1 bg-opacity-70";
    return "bg-scrum-chart-line-1";
  };

  // Create a grid of contribution squares for display
  const today = new Date();
  const daysInWeek = 7;
  const weeksToShow = 52;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Create an array of dates for the current week's column
  const getContributionValue = (date: string) => {
    const contribution = contributions.find(c => c.date === date);
    return contribution ? contribution.count : 0;
  };

  const renderContributionGrid = () => {
    // Initialize days of the week (rows)
    const grid = Array(daysInWeek).fill(null).map(() => []);
    
    // Calculate the start date (going back weeksToShow weeks)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (weeksToShow * 7) + (6 - today.getDay()));
    
    // Fill the grid
    for (let week = 0; week < weeksToShow; week++) {
      for (let day = 0; day < daysInWeek; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (week * 7) + day);
        
        const dateStr = currentDate.toISOString().split('T')[0];
        const contributionCount = getContributionValue(dateStr);
        
        grid[day].push({
          date: dateStr,
          count: contributionCount,
          month: currentDate.getMonth(),
          dayOfMonth: currentDate.getDate()
        });
      }
    }
    
    return (
      <div className="flex flex-col">
        <div className="flex text-xs text-scrum-text-secondary mb-1 ml-6">
          {months.map((month, i) => {
            // Find first occurrence of each month in the first row
            const firstOccurrence = grid[0].findIndex(d => d.month === i);
            if (firstOccurrence === -1) return null;
            
            // Calculate position based on week
            const style = { 
              marginLeft: firstOccurrence === 0 ? 0 : (firstOccurrence * 4) - 8 
            };
            
            return (
              <div key={month} className="mr-8" style={style}>
                {month}
              </div>
            );
          })}
        </div>
        
        <div className="flex">
          <div className="flex flex-col mr-2 text-xs text-scrum-text-secondary pt-2">
            {days.map(day => (
              <div key={day} className="h-4 flex items-center justify-start mb-1">
                {day.charAt(0)}
              </div>
            ))}
          </div>
          
          <div className="grid grid-flow-col gap-1">
            {grid.map((weekRow, rowIndex) => (
              <div key={rowIndex} className="flex flex-col gap-1">
                {weekRow.map(day => (
                  <div
                    key={day.date}
                    className={`h-4 w-4 rounded-sm ${getColorClass(day.count)}`}
                    title={`${day.date}: ${day.count} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      {renderContributionGrid()}
      <div className="flex items-center justify-end mt-2 text-xs text-scrum-text-secondary">
        <div>Less</div>
        <div className="flex items-center ml-2">
          <div className="h-3 w-3 rounded-sm bg-scrum-card"></div>
          <div className="h-3 w-3 rounded-sm bg-scrum-chart-line-1 bg-opacity-30 ml-1"></div>
          <div className="h-3 w-3 rounded-sm bg-scrum-chart-line-1 bg-opacity-50 ml-1"></div>
          <div className="h-3 w-3 rounded-sm bg-scrum-chart-line-1 bg-opacity-70 ml-1"></div>
          <div className="h-3 w-3 rounded-sm bg-scrum-chart-line-1 ml-1"></div>
        </div>
        <div className="ml-2">More</div>
      </div>
    </div>
  );
};

export default UserContributions;
