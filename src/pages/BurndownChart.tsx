
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { supabase, fetchBurndownData, upsertBurndownData } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from "recharts";
import { format, parseISO, startOfDay, addDays, isBefore, isAfter, isToday, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { Task, Sprint } from "@/types";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

interface BurndownDataPoint {
  date: string;
  ideal: number;
  actual: number | null;
  formattedDate: string;
}

const BurndownChart: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject, getTasksBySprint, getSprintsByProject, tasks, sprints } = useProjects();
  const { user } = useAuth();
  const [chartData, setChartData] = useState<BurndownDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastTasksLength, setLastTasksLength] = useState(0);
  const [lastSprintsLength, setLastSprintsLength] = useState(0);
  const dataFetchedRef = useRef(false);
  const loadingTimeoutRef = useRef<number | null>(null);
  
  const project = getProject(projectId || "");
  const projectSprints = projectId ? getSprintsByProject(projectId) : [];
  
  useEffect(() => {
    if (!projectId || !user) return;
    
    const loadBurndownData = async () => {
      setIsLoading(true);
      dataFetchedRef.current = false;
      
      try {
        const availableSprints = getSprintsByProject(projectId);
        
        if (availableSprints.length === 0) {
          setIsLoading(false);
          dataFetchedRef.current = true;
          return;
        }
        
        const existingData = await fetchBurndownData(projectId, user.id);
        
        if (existingData && existingData.length > 0) {
          const formattedData = existingData.map(item => ({
            ...item,
            formattedDate: format(parseISO(item.date), "MMM dd")
          }));
          setChartData(formattedData);
        } else {
          await generateAndSaveBurndownData();
        }
      } catch (error) {
        console.error("Error loading burndown data:", error);
        const availableSprints = getSprintsByProject(projectId);
        if (availableSprints.length > 0) {
          await generateAndSaveBurndownData();
        }
      } finally {
        if (loadingTimeoutRef.current) window.clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = window.setTimeout(() => {
          setIsLoading(false);
          dataFetchedRef.current = true;
        }, 500);
      }
    };
    
    loadBurndownData();
    
    return () => {
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [projectId, user, getSprintsByProject]);
  
  useEffect(() => {
    if (!projectId || !user || isLoading || !dataFetchedRef.current) return;
    
    const projectSprints = getSprintsByProject(projectId);
    if (projectSprints.length === 0) return;
    
    const currentTasksCount = tasks.filter(t => t.projectId === projectId).length;
    const currentSprintsCount = projectSprints.length;
    
    const shouldUpdate = 
      currentTasksCount !== lastTasksLength || 
      currentSprintsCount !== lastSprintsLength;
    
    if (shouldUpdate && !isUpdating) {
      const updateBurndownData = async () => {
        try {
          setIsUpdating(true);
          await generateAndSaveBurndownData();
          
          setLastTasksLength(currentTasksCount);
          setLastSprintsLength(currentSprintsCount);
        } catch (error) {
          console.error("Error updating burndown data:", error);
        } finally {
          setIsUpdating(false);
        }
      };
      
      updateBurndownData();
    }
  }, [tasks, sprints, projectId, user, isLoading, lastTasksLength, lastSprintsLength, isUpdating, getSprintsByProject]);
  
  const generateAndSaveBurndownData = async () => {
    try {
      if (!projectId || !user) return [];
      
      const burndownData = await generateBurndownData();
      setChartData(burndownData);
      
      if (burndownData.length > 0) {
        const saved = await upsertBurndownData(projectId, user.id, burndownData);
        if (!saved) {
          console.warn("Failed to save burndown data to database");
        }
      }
      
      return burndownData;
    } catch (error) {
      console.error("Error generating burndown data:", error);
      toast.error("Failed to generate burndown chart data");
      return [];
    }
  };
  
  const generateBurndownData = async (): Promise<BurndownDataPoint[]> => {
    const data: BurndownDataPoint[] = [];
    const today = startOfDay(new Date());
    
    const projectSprints = getSprintsByProject(projectId || "");
    
    if (projectSprints.length === 0) {
      return [];
    }
    
    const projectTasks: Task[] = [];
    for (const sprint of projectSprints) {
      const sprintTasks = getTasksBySprint(sprint.id);
      projectTasks.push(...sprintTasks);
    }
    
    const tasksWithPoints = projectTasks.filter(task => 
      task.storyPoints !== undefined && task.storyPoints > 0
    );
    
    if (tasksWithPoints.length === 0) {
      return [];
    }
    
    let earliestStartDate: Date | null = null;
    let latestEndDate: Date | null = null;
    
    for (const sprint of projectSprints) {
      const startDate = parseISO(sprint.startDate);
      const endDate = parseISO(sprint.endDate);
      
      if (!earliestStartDate || isBefore(startDate, earliestStartDate)) {
        earliestStartDate = startDate;
      }
      
      if (!latestEndDate || isAfter(endDate, latestEndDate)) {
        latestEndDate = endDate;
      }
    }
    
    if (!earliestStartDate || !latestEndDate) {
      return [];
    }
    
    const daysInProject = differenceInDays(latestEndDate, earliestStartDate) + 1;
    const timeframeDays = Math.max(daysInProject, 7);
    
    const totalStoryPoints = tasksWithPoints.reduce((sum, task) => 
      sum + (task.storyPoints || 0), 0
    );
    
    if (totalStoryPoints === 0) {
      return [];
    }
    
    const completedTasksByDate = new Map<string, Task[]>();
    tasksWithPoints.forEach(task => {
      if (task.status === 'done' && task.completionDate) {
        const dateKey = task.completionDate.split('T')[0];
        if (!completedTasksByDate.has(dateKey)) {
          completedTasksByDate.set(dateKey, []);
        }
        const tasks = completedTasksByDate.get(dateKey);
        if (tasks) {
          tasks.push(task);
        }
      }
    });
    
    const uniqueData = new Map<string, BurndownDataPoint>();
    
    let remainingPoints = totalStoryPoints;
    const pointsPerDay = totalStoryPoints / timeframeDays;
    
    for (let i = 0; i < timeframeDays; i++) {
      const date = addDays(earliestStartDate, i);
      const dateStr = date.toISOString().split('T')[0];
      const formattedDate = format(date, "MMM dd");
      
      const idealRemaining = Math.max(0, totalStoryPoints - (i * pointsPerDay));
      
      let actualPoints: number | null = null;
      
      if (isBefore(date, today) || isToday(date)) {
        let completedPoints = 0;
        
        for (let j = 0; j <= i; j++) {
          const checkDate = addDays(earliestStartDate, j);
          const checkDateStr = checkDate.toISOString().split('T')[0];
          
          if (completedTasksByDate.has(checkDateStr)) {
            const tasksCompletedOnDate = completedTasksByDate.get(checkDateStr) || [];
            
            for (const task of tasksCompletedOnDate) {
              completedPoints += (task.storyPoints || 0);
            }
          }
        }
        
        actualPoints = Math.max(0, totalStoryPoints - completedPoints);
      }
      
      uniqueData.set(dateStr, {
        date: dateStr,
        ideal: Math.round(idealRemaining),
        actual: actualPoints !== null ? Math.round(actualPoints) : null,
        formattedDate
      });
    }
    
    return Array.from(uniqueData.values());
  };
  
  const calculateTotalStoryPoints = (sprints: Sprint[]): number => {
    let totalPoints = 0;
    
    for (const sprint of sprints) {
      const sprintTasks = getTasksBySprint(sprint.id);
      totalPoints += sprintTasks.reduce((sum, task) => {
        return sum + (task.storyPoints || 0);
      }, 0);
    }
    
    return totalPoints;
  };
  
  const groupCompletedSprintsByEndDate = (sprints: Sprint[]): Map<string, Sprint[]> => {
    const sprintsByEndDate = new Map<string, Sprint[]>();
    
    for (const sprint of sprints) {
      if (sprint.status === 'completed') {
        const endDateStr = sprint.endDate.split('T')[0];
        
        if (!sprintsByEndDate.has(endDateStr)) {
          sprintsByEndDate.set(endDateStr, []);
        }
        
        const sprints = sprintsByEndDate.get(endDateStr);
        if (sprints) {
          sprints.push(sprint);
        }
      }
    }
    
    return sprintsByEndDate;
  };
  
  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="scrum-card mb-6">
          <h2 className="text-xl font-bold mb-2">Project Burndown Chart</h2>
          <p className="text-scrum-text-secondary">
            Loading chart data...
          </p>
        </div>
        
        <div className="scrum-card h-[500px]">
          <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <div className="w-full h-full flex flex-col">
              <div className="flex justify-between mb-4">
                <Skeleton className="h-5 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
              
              <div className="flex-1 w-full relative">
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-5 gap-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`h-line-${i}`} className="col-span-6 border-t border-scrum-border opacity-20" />
                  ))}
                  
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div 
                      key={`v-line-${i}`} 
                      className="row-span-5 border-l border-scrum-border opacity-20"
                      style={{gridColumnStart: i+1}} 
                    />
                  ))}
                </div>
                
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between py-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={`y-${i}`} className="h-4 w-8 opacity-70" />
                  ))}
                </div>
                
                <div className="absolute left-10 right-0 bottom-0 flex justify-between pb-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={`x-${i}`} className="h-4 w-12 opacity-70" />
                  ))}
                </div>
                
                <div className="absolute inset-0 pt-8 pb-8 px-12">
                  {/* Ideal line */}
                  <div className="h-1 w-full bg-scrum-border opacity-70 transform -rotate-12 origin-top-left mt-4 rounded-full"></div>
                  
                  {/* Actual line segments with subtle variations */}
                  <div className="relative h-full">
                    <div className="h-1 w-3/4 bg-scrum-chart-line-2 opacity-30 absolute top-1/4 transform -rotate-6 origin-left rounded-full"></div>
                    <div className="h-1 w-1/2 bg-scrum-chart-line-2 opacity-30 absolute top-1/2 transform -rotate-3 origin-left rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-8 mt-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-scrum-chart-line-1 opacity-70"></div>
                  <Skeleton className="h-5 w-24 opacity-70" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-scrum-chart-line-2 opacity-70"></div>
                  <Skeleton className="h-5 w-24 opacity-70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (projectSprints.length === 0) {
    return (
      <div className="text-center py-12 bg-scrum-card border border-scrum-border rounded-lg animate-fade-in">
        <h2 className="text-xl font-bold mb-4">Project Burndown Chart</h2>
        <p className="text-scrum-text-secondary mb-4">
          No sprints available. Create sprints to view the burndown chart.
        </p>
      </div>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <div className="text-center py-12 bg-scrum-card border border-scrum-border rounded-lg animate-fade-in">
        <h2 className="text-xl font-bold mb-4">Project Burndown Chart</h2>
        <p className="text-scrum-text-secondary mb-4">
          Unable to generate burndown chart. Make sure your sprints have tasks with story points.
        </p>
      </div>
    );
  }
  
  const today = startOfDay(new Date());
  const todayStr = today.toISOString().split('T')[0];
  const todayIndex = chartData.findIndex(d => d.date === todayStr);
  const todayLabel = todayIndex >= 0 && chartData[todayIndex] 
    ? chartData[todayIndex].formattedDate 
    : format(today, "MMM dd");
  
  const lastActualIndex = chartData.reduce((lastIdx, point, idx) => {
    return point.actual !== null ? idx : lastIdx;
  }, -1);

  const config = {
    ideal: { color: "hsl(var(--scrum-chart-line-1))", label: "Ideal Burndown" },
    actual: { color: "hsl(var(--scrum-chart-line-2))", label: "Actual Burndown" }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="scrum-card mb-6">
        <h2 className="text-xl font-bold mb-2">Project Burndown Chart</h2>
        <p className="text-scrum-text-secondary">
          Tracking progress across all sprints in {project?.title || "this project"}
        </p>
      </div>
      
      <div className="scrum-card h-[500px]">
        <ChartContainer config={config} className="w-full h-full">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--scrum-chart-grid))" />
            <XAxis
              dataKey="formattedDate"
              stroke="hsl(var(--scrum-chart-axis))"
              tick={{ fill: "hsl(var(--scrum-chart-axis))" }}
              axisLine={{ stroke: "hsl(var(--scrum-chart-grid))" }}
            />
            <YAxis
              label={{ 
                value: "Story Points Remaining", 
                angle: -90, 
                position: "insideLeft", 
                fill: "hsl(var(--scrum-chart-axis))" 
              }}
              stroke="hsl(var(--scrum-chart-axis))"
              tick={{ fill: "hsl(var(--scrum-chart-axis))" }}
              axisLine={{ stroke: "hsl(var(--scrum-chart-grid))" }}
            />
            <Tooltip
              content={
                (props) => {
                  return React.createElement(ChartTooltipContent as any, {
                    ...props,
                    nameKey: "dataKey",
                    indicator: "dot"
                  });
                }
              }
            />
            <Legend
              content={
                (props) => {
                  return React.createElement(ChartLegendContent as any, {
                    ...props
                  });
                }
              }
              verticalAlign="bottom"
            />
            {todayLabel && (
              <ReferenceLine 
                x={todayLabel} 
                stroke="hsl(var(--scrum-chart-reference))" 
                strokeWidth={2}
                strokeDasharray="5 3" 
                label={{ 
                  value: "TODAY", 
                  position: "top", 
                  fill: "hsl(var(--scrum-chart-reference))",
                  fontSize: 12,
                  fontWeight: "bold"
                }} 
              />
            )}
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="hsl(var(--scrum-chart-line-1))"
              strokeWidth={2}
              name="ideal"
              dot={false}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--scrum-chart-line-2))"
              strokeWidth={2}
              name="actual"
              dot={(props) => {
                const { cx, cy, payload, index } = props;
                if (!payload || payload.actual === null || payload.actual === undefined) return null;
                
                if (index === lastActualIndex) {
                  return (
                    <svg x={cx - 5} y={cy - 5} width={10} height={10}>
                      <circle cx={5} cy={5} r={5} fill="hsl(var(--scrum-chart-line-2))" />
                    </svg>
                  );
                }
                
                return null;
              }}
              activeDot={{ r: 8 }}
              connectNulls={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
      
      <div className="scrum-card mt-6 p-4">
        <h3 className="text-lg font-medium mb-3">How to Read the Burndown Chart</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-scrum-text-secondary">
          <li>
            <strong>Ideal Burndown</strong>: Shows the theoretical perfect progress where work is completed at a constant rate.
          </li>
          <li>
            <strong>Actual Burndown</strong>: Shows the actual remaining work based on completed tasks.
          </li>
          <li>
            When the Actual line is <strong>above</strong> the Ideal line, the project is <strong>behind schedule</strong>.
          </li>
          <li>
            When the Actual line is <strong>below</strong> the Ideal line, the project is <strong>ahead of schedule</strong>.
          </li>
          <li>
            The <strong style={{ color: "hsl(var(--scrum-chart-reference))" }}>TODAY</strong> line marks the current date on the timeline.
          </li>
          <li>
            Progress is calculated based on the <strong>completion date of tasks</strong> in the DONE column of their respective SprintBoard.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BurndownChart;
