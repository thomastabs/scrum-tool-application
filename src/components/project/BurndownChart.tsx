
import React, { useMemo } from "react";
import { useProject } from "@/context/ProjectContext";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprint, Task } from "@/types";
import { format, differenceInDays, addDays, isBefore, isAfter } from "date-fns";

interface BurndownChartProps {
  projectId: string;
}

const BurndownChart: React.FC<BurndownChartProps> = ({ projectId }) => {
  const { sprints, columns } = useProject();

  // Filter sprints by project
  const projectSprints = useMemo(() => {
    return sprints.filter(sprint => sprint.projectId === projectId);
  }, [sprints, projectId]);

  // Calculate total story points across all sprints for the project
  const burndownData = useMemo(() => {
    if (projectSprints.length === 0) return [];

    // Sort sprints by start date
    const sortedSprints = [...projectSprints].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );

    // Find earliest start date and latest end date across all sprints
    const earliestStart = sortedSprints[0].startDate;
    const latestEnd = sortedSprints[sortedSprints.length - 1].endDate;
    
    // Calculate total span in days
    const totalDays = differenceInDays(latestEnd, earliestStart) + 1;

    // Initialize data array with dates and empty values
    const data = Array.from({ length: totalDays }, (_, index) => {
      const date = addDays(earliestStart, index);
      return {
        date: format(date, "MMM dd"),
        ideal: 0,
        actual: 0,
        rawDate: date
      };
    });

    // Calculate total story points for all tasks in all sprints
    let totalStoryPoints = 0;
    
    // Find all tasks from all columns that belong to any sprint in this project
    projectSprints.forEach(sprint => {
      const sprintColumns = columns.filter(col => col.sprint_id === sprint.id);
      sprintColumns.forEach(column => {
        column.tasks.forEach(task => {
          if (task.sprintId === sprint.id) {
            totalStoryPoints += task.storyPoints || 1;
          }
        });
      });
    });
    
    // Calculate ideal burndown line (from total points to 0)
    if (totalStoryPoints > 0) {
      data.forEach((day, index) => {
        // Ideal is a straight line from total to 0
        day.ideal = totalStoryPoints - (totalStoryPoints * (index / (totalDays - 1)));
      });
    }
    
    // Calculate actual burndown based on completed tasks
    // We'll consider tasks in "DONE" columns as completed
    if (totalStoryPoints > 0) {
      let remainingPoints = totalStoryPoints;
      
      data.forEach(day => {
        // For each day, check if any tasks were completed
        projectSprints.forEach(sprint => {
          const sprintColumns = columns.filter(col => col.sprint_id === sprint.id);
          const doneColumn = sprintColumns.find(col => col.title === "DONE");
          
          if (doneColumn) {
            doneColumn.tasks.forEach((task: Task) => {
              // If task was completed on or before this day, subtract points
              if (task.updatedAt && isBefore(task.updatedAt, day.rawDate)) {
                remainingPoints -= task.storyPoints || 1;
              }
            });
          }
        });
        
        day.actual = Math.max(0, remainingPoints);
      });
    }
    
    return data;
  }, [projectSprints, columns, projectId]);

  if (projectSprints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Burndown Chart</CardTitle>
          <CardDescription>No sprints found for this project.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Project Burndown Chart</CardTitle>
        <CardDescription>
          Tracking progress across all sprints in this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={burndownData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="#8884d8"
                name="Ideal Burndown"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#82ca9d"
                name="Actual Burndown"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BurndownChart;
