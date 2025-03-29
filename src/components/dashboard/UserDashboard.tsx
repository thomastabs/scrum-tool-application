
import React from 'react';
import UserContributions from './UserContributions';
import UserStats from './UserStats';
import UserTasks from './UserTasks';

const UserDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <UserContributions />
      <UserStats />
      <UserTasks />
    </div>
  );
};

export default UserDashboard;
