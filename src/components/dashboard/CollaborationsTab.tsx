
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CollaborationsTab = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchCollaborations = async () => {
      setLoading(true);
      // In the future, this would fetch projects where the user is a collaborator but not the owner
      setLoading(false);
    };

    fetchCollaborations();
  }, []);

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
            Collaboration features will be implemented in the future. This tab will show projects that other users have shared with you.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollaborationsTab;
