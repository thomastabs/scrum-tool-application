import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import UserSettings from './pages/UserSettings';
import ProjectDetail from './pages/ProjectDetail';
import EditProject from './pages/EditProject';
import ProductBacklog from './pages/ProductBacklog';
import BacklogItemForm from './pages/BacklogItemForm';
import SprintBoard from './pages/SprintBoard';
import EditSprint from './pages/EditSprint';
import ProjectTimeline from './pages/ProjectTimeline';
import BurndownChart from './pages/BurndownChart';
import ProjectTeam from './pages/ProjectTeam';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "sonner";

function App() {
  const [loading, setLoading] = useState(true);
  const { checkSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const user = await checkSession();
      
      // If the user is not logged in and tries to access a protected route, redirect to login
      const publicRoutes = ['/login', '/register'];
      const isPublicRoute = publicRoutes.includes(location.pathname);
      
      if (!user && !isPublicRoute) {
        navigate('/login');
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, [checkSession, navigate, location]);

  return (
    <AuthProvider>
      <ProjectProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user/settings" element={
            <ProtectedRoute>
              <UserSettings />
            </ProtectedRoute>
          } />
          
          <Route path="/projects/:projectId" element={
            <ProtectedRoute>
              <ProjectLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ProjectDetail />} />
            <Route path="edit" element={<EditProject />} />
            <Route path="backlog" element={<ProductBacklog />} />
            <Route path="backlog/new" element={<BacklogItemForm />} />
            <Route path="sprints/:sprintId" element={<SprintBoard />} />
            <Route path="sprints/:sprintId/edit" element={<EditSprint />} />
            <Route path="timeline" element={<ProjectTimeline />} />
            <Route path="burndown" element={<BurndownChart />} />
            <Route path="team" element={<ProjectTeam />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
