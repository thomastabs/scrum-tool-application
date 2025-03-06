
import React from "react";

const DashboardHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">Scrumify Hub</h1>
        <p className="text-muted-foreground mt-2">Dashboard</p>
      </div>
    </div>
  );
};

export default DashboardHeader;
