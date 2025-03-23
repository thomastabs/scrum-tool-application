
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/context/ProjectContext";
import AddCollaboratorForm from "@/components/collaborations/AddCollaboratorForm";
import CollaboratorsList from "@/components/collaborations/CollaboratorsList";
import { Users, MessageSquare } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProjectChat from "@/components/chat/ProjectChat";
import { useAuth } from "@/context/AuthContext";

const ProjectTeam: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject } = useProjects();
  const { isOwner } = useAuth() as any;
  const [refresh, setRefresh] = useState(0);
  
  const project = getProject(projectId || "");
  
  const handleCollaboratorChange = () => {
    setRefresh(prev => prev + 1);
  };
  
  if (!project) {
    return (
      <div className="text-center py-8">
        Project not found
      </div>
    );
  }
  
  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-6 w-6 text-scrum-text-secondary" />
        <h2 className="text-2xl font-bold">Project Team</h2>
      </div>
      
      <Tabs defaultValue="collaborators" className="w-full">
        <TabsList className="mb-6 bg-scrum-card border border-scrum-border">
          <TabsTrigger value="collaborators" className="data-[state=active]:bg-scrum-accent data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Collaborators
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-scrum-accent data-[state=active]:text-white">
            <MessageSquare className="h-4 w-4 mr-2" />
            Team Chat
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="collaborators">
          {isOwner && (
            <div className="mb-8">
              <AddCollaboratorForm 
                projectId={project.id} 
                onCollaboratorAdded={handleCollaboratorChange}
              />
            </div>
          )}
          
          <div>
            <CollaboratorsList 
              key={refresh} 
              projectId={project.id} 
              onCollaboratorsChange={handleCollaboratorChange}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="chat" className="mt-4">
          <div className="scrum-card">
            <ProjectChat />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectTeam;
