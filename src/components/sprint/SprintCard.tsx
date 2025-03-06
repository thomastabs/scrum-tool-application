
import React from "react";
import { Sprint } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Edit } from "lucide-react";

interface SprintCardProps {
  sprint: Sprint;
  projectId: string;
  onEdit: (sprint: Sprint) => void;
  onViewSprint: (sprint: Sprint) => void;
}

const SprintCard: React.FC<SprintCardProps> = ({ 
  sprint, 
  projectId, 
  onEdit,
  onViewSprint
}) => {
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const isCompleted = sprint.isCompleted;
  
  return (
    <Card className={`overflow-hidden ${isCompleted ? 'border-green-200' : ''}`}>
      <CardHeader className="pb-2 relative">
        {isCompleted && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
            </Badge>
          </div>
        )}
        <h3 className="text-xl font-semibold mb-1 pr-24">{sprint.title}</h3>
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" /> 
          {formatDate(startDate)} - {formatDate(endDate)}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {sprint.description || "No description provided."}
        </p>
      </CardContent>
      
      <CardFooter className="pt-0 justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(sprint)}
        >
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        
        <Button 
          onClick={() => onViewSprint(sprint)}
          disabled={isCompleted}
        >
          View Board
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SprintCard;
