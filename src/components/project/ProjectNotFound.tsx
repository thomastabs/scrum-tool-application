
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProjectNotFound: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <p className="mb-6">The project you're looking for does not exist.</p>
        <Button asChild>
          <Link to="/?tab=projects">Go Back to Projects</Link>
        </Button>
      </div>
    </div>
  );
};

export default ProjectNotFound;
