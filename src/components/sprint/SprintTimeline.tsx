
import React, { useMemo } from "react";
import { formatDistance } from "date-fns";
import { Sprint } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from "recharts";
import { useTheme } from "@/context/ThemeContext";

interface SprintTimelineProps {
  sprints: Sprint[];
  onCreateSprint: () => void;
}

interface TimelineData {
  name: string;
  start: number;
  duration: number;
  sprint: Sprint;
}

/**
 * SprintTimeline - Visualizes sprints on a timeline chart
 * 
 * @param {Sprint[]} sprints - Array of sprints to display on the timeline
 * @param {Function} onCreateSprint - Function to call when creating a new sprint
 * @returns Timeline view of all sprints with a Gantt-like chart
 */
const SprintTimeline: React.FC<SprintTimelineProps> = ({ sprints, onCreateSprint }) => {
  const { theme } = useTheme();
  
  // Process the data for the timeline chart
  const timelineData = useMemo(() => {
    if (!sprints.length) return [];

    // Sort sprints by start date
    const sortedSprints = [...sprints].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    // Find the earliest and latest dates to establish timeline boundaries
    const earliestDate = new Date(sortedSprints[0].startDate).getTime();
    
    // Create data for the chart
    return sortedSprints.map((sprint) => {
      const startDate = new Date(sprint.startDate);
      const endDate = new Date(sprint.endDate);
      const start = startDate.getTime();
      const duration = endDate.getTime() - start;

      return {
        name: sprint.title,
        start: (start - earliestDate) / (1000 * 60 * 60 * 24), // days from earliest
        duration: duration / (1000 * 60 * 60 * 24), // duration in days
        sprint
      };
    });
  }, [sprints]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as TimelineData;
      const sprint = data.sprint;
      const startDate = new Date(sprint.startDate);
      const endDate = new Date(sprint.endDate);
      
      return (
        <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-2 border rounded shadow-md text-sm`}>
          <p className="font-semibold">{sprint.title}</p>
          <p>{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</p>
          <p>Duration: {formatDistance(endDate, startDate)}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate days remaining or days overdue
  const getDaysStatus = (sprint: Sprint) => {
    const now = new Date();
    const endDate = new Date(sprint.endDate);
    
    if (sprint.isCompleted) {
      return "Completed";
    }
    
    if (now > endDate) {
      const days = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
      return `Overdue (${days} days past)`;
    } else {
      const days = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} days left`;
    }
  };

  if (sprints.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No Sprints Yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first sprint to see your project timeline.
        </p>
      </div>
    );
  }

  const axisTextColor = theme === 'dark' ? '#e0e0e0' : '#333333';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const barColor = theme === 'dark' ? '#8884d8' : '#8884d8';
  const barBackground = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#eee';

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6 bg-card">
        <h3 className="text-xl font-bold mb-2">Sprint Timeline</h3>
        <p className="text-muted-foreground mb-6">Visualize your sprint schedule</p>
        
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={timelineData}
              margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
              <XAxis 
                type="number" 
                label={{ value: 'Days', position: 'insideBottom', offset: -15, fill: axisTextColor }} 
                stroke={axisTextColor}
                tick={{ fill: axisTextColor }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                stroke={axisTextColor}
                tick={{ fill: axisTextColor }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="duration" 
                stackId="a" 
                fill={barColor} 
                barSize={20}
                radius={[4, 4, 4, 4]}
                background={{ fill: barBackground }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sprints.map((sprint) => {
          const startDate = new Date(sprint.startDate);
          const endDate = new Date(sprint.endDate);
          const borderColor = sprint.isCompleted 
            ? "border-l-4 border-l-green-500" 
            : "border-l-4 border-l-blue-500";
          const statusColor = sprint.isCompleted 
            ? "text-green-600 dark:text-green-400" 
            : "text-blue-600 dark:text-blue-400";

          return (
            <Card key={sprint.id} className={`${borderColor} shadow-sm`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{sprint.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-1">
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </p>
                <p className="text-sm mb-2 line-clamp-2">{sprint.description}</p>
                <p className={`text-sm font-medium ${statusColor}`}>
                  {sprint.isCompleted ? "Completed" : "Active"} ({getDaysStatus(sprint)})
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SprintTimeline;
