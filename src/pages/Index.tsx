
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Flag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Active Sprint",
    value: "Sprint 23",
    icon: Calendar,
    description: "Ends in 5 days",
  },
  {
    title: "Team Members",
    value: "8",
    icon: Users,
    description: "2 recently added",
  },
  {
    title: "Sprint Goals",
    value: "4/6",
    icon: Flag,
    description: "On track",
  },
];

const Index = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-lg text-gray-500 mt-2">
            Here's what's happening with your team today.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <span>New Sprint</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden transition-all duration-200 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center p-4 bg-white rounded-lg shadow-sm"
              >
                <div className="w-2 h-2 bg-primary rounded-full mr-4" />
                <div>
                  <p className="font-medium">Task updated</p>
                  <p className="text-sm text-gray-500">
                    John Doe updated the status of "Implement dashboard"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
