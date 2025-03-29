
import React from "react";
import UserContributions from "./UserContributions";
import UserStats from "./UserStats";
import UserTasks from "./UserTasks";
import { useAuth } from "@/context/AuthContext";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="bg-scrum-card border border-scrum-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Your Contribution Activity</h2>
        <UserContributions userId={user.id} />
      </div>

      <div className="bg-scrum-card border border-scrum-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Your Stats</h2>
        <UserStats userId={user.id} />
      </div>

      <div className="bg-scrum-card border border-scrum-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Your Tasks In Progress</h2>
        <UserTasks userId={user.id} />
      </div>
    </div>
  );
};

export default UserDashboard;
