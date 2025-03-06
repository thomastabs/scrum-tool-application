
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon } from "lucide-react";

const CollaborationsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Collaborations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">
            Collaboration features will be implemented in the future.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollaborationsTab;
