
import React from "react";
import { useProject } from "@/context/ProjectContext";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Sprint } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineProps {
  projectId: string;
}

const Timeline: React.FC<TimelineProps> = ({ projectId }) => {
  const { sprints } = useProject();
  
  // Filter sprints for the current project and sort by start date
  const projectSprints = sprints
    .filter(sprint => sprint.projectId === projectId)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  if (projectSprints.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              No sprints found for this project. Create sprints to see them on the timeline.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform sprints data for the chart
  const timelineData = projectSprints.map(sprint => {
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    
    return {
      name: sprint.title,
      start: startDate.getTime(),
      end: endDate.getTime(),
      duration: (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24), // in days
      status: sprint.isCompleted ? "Completed" : "Active",
      startFormatted: format(startDate, "MMM d, yyyy"),
      endFormatted: format(endDate, "MMM d, yyyy"),
    };
  });

  // Find the earliest and latest dates to set the domain
  const earliestDate = Math.min(...timelineData.map(d => d.start));
  const latestDate = Math.max(...timelineData.map(d => d.end));

  // Custom tooltip to display sprint details
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-bold">{data.name}</p>
          <p className="text-sm">
            {data.startFormatted} - {data.endFormatted}
          </p>
          <p className="text-sm">Duration: {Math.round(data.duration)} days</p>
          <p className="text-sm">Status: {data.status}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={timelineData}
              margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[earliestDate, latestDate]}
                tickFormatter={timestamp => format(new Date(timestamp), "MMM d")}
                label={{ value: "Date", position: "insideBottom", offset: -10 }}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="duration"
                name="Sprint Duration"
                fill="#8884d8"
                background={{ fill: "#eee" }}
                barSize={20}
                radius={[4, 4, 4, 4]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default Timeline;
