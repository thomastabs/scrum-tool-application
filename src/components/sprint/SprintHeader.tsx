
import React from "react";
import { Sprint } from "@/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SprintHeaderProps {
  sprint: Sprint;
  canComplete: boolean;
  onCompleteSprint: (sprintId: string) => void;
}

const SprintHeader: React.FC<SprintHeaderProps> = ({ 
  sprint, 
  canComplete, 
  onCompleteSprint 
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{sprint.title}</h2>
          <p className="text-muted-foreground">
            {sprint.description}
          </p>
          <div className="flex gap-4 mt-2 text-sm">
            <span>Start: {new Date(sprint.startDate).toLocaleDateString()}</span>
            <span>End: {new Date(sprint.endDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {!sprint.isCompleted && (
            <Button
              variant="outline" 
              onClick={() => onCompleteSprint(sprint.id)}
              disabled={!canComplete}
            >
              Complete Sprint
            </Button>
          )}
        </div>
      </div>

      {sprint.isCompleted && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle>Sprint Completed</AlertTitle>
          <AlertDescription>
            This sprint has been marked as completed.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default SprintHeader;
