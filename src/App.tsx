
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SprintPage from './pages/SprintPage';
import NotFound from './pages/NotFound';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/my-projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/my-projects/:projectId/sprints/:sprintId" element={<SprintPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </ProjectProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
