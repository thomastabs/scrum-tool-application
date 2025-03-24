
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { fetchProjectCollaborators } from "@/lib/supabase";
import { Users, Mail, SendHorizontal } from "lucide-react";
import { Collaborator } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Interface for chat messages
interface ChatMessage {
  id: string;
  message: string;
  userId: string;
  username: string;
  createdAt: string;
}

const ProjectTeam: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject } = useProjects();
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [owner, setOwner] = useState<{id: string, username: string, email?: string} | null>(null);
  const [activeTab, setActiveTab] = useState<string>("team");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const project = getProject(projectId || "");
  
  useEffect(() => {
    const loadCollaborators = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      try {
        // Get collaborators
        const collaboratorsData = await fetchProjectCollaborators(projectId);
        setCollaborators(collaboratorsData);
        
        // Set owner data if available from project
        if (project?.ownerId && project?.ownerName) {
          setOwner({
            id: project.ownerId,
            username: project.ownerName,
            email: undefined
          });
        }
      } catch (error) {
        console.error("Error loading team data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCollaborators();
  }, [projectId, project]);

  // Load chat messages when tab is active
  useEffect(() => {
    if (activeTab !== "chat" || !projectId) return;
    
    const loadChatMessages = async () => {
      try {
        // Fix: Specify the table and column explicitly to avoid ambiguity
        const { data, error } = await supabase
          .from('chat_messages')
          .select('id, message, user_id, username, created_at')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        const formattedMessages: ChatMessage[] = (data || []).map(msg => ({
          id: msg.id,
          message: msg.message,
          userId: msg.user_id,
          username: msg.username,
          createdAt: msg.created_at
        }));
        
        setChatMessages(formattedMessages);
      } catch (error) {
        console.error("Error loading chat messages:", error);
        toast.error("Failed to load chat messages");
      }
    };
    
    loadChatMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('project-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        console.log('New message received:', payload);
        const newMsg = payload.new as any;
        
        setChatMessages(prev => [...prev, {
          id: newMsg.id,
          message: newMsg.message,
          userId: newMsg.user_id,
          username: newMsg.username,
          createdAt: newMsg.created_at
        }]);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, projectId]);
  
  const handleSendMessage = async () => {
    if (!user || !projectId || !newMessage.trim()) return;
    
    setIsSending(true);
    try {
      // Critical fix: Add method and specify full chat_messages table name to avoid ambiguity
      const { error } = await supabase.rpc(
        'insert_chat_message',
        {
          p_project_id: projectId,
          p_user_id: user.id,
          p_username: user.username || user.email?.split('@')[0] || 'Anonymous',
          p_message: newMessage.trim()
        }
      );
        
      if (error) throw error;
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };
  
  const isOwnMessage = (userId: string) => {
    return user?.id === userId;
  };
  
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">Loading team information...</div>
      </div>
    );
  }
  
  const getRoleBadgeClass = (role: string) => {
    switch(role) {
      case 'scrum_master':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case 'product_owner':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case 'team_member':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-400";
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Team</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="team" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Team Members</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <span>Project Chat</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="team" className="space-y-4">
          <div className="scrum-card p-6">
            <h3 className="text-lg font-semibold mb-4">Project Owner</h3>
            {owner ? (
              <div className="flex items-center gap-3 p-3 bg-background rounded-md border border-border">
                <div className="h-10 w-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold">{owner.username.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{owner.username}</div>
                  {owner.email && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      <span>{owner.email}</span>
                    </div>
                  )}
                  <div className="text-xs px-2 py-1 rounded-full inline-block bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 mt-1">
                    Owner
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Owner information not available</div>
            )}
          </div>
          
          <div className="scrum-card p-6">
            <h3 className="text-lg font-semibold mb-4">Team Members</h3>
            {collaborators.length > 0 ? (
              <div className="space-y-3">
                {collaborators.map(collab => (
                  <div key={collab.id} className="flex items-center gap-3 p-3 bg-background rounded-md border border-border">
                    <div className="h-10 w-10 bg-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold">{collab.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{collab.username}</div>
                      {collab.email && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3" />
                          <span>{collab.email}</span>
                        </div>
                      )}
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${getRoleBadgeClass(collab.role)} mt-1`}>
                        {collab.role === 'scrum_master' ? 'Scrum Master' : 
                         collab.role === 'product_owner' ? 'Product Owner' : 
                         'Team Member'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No team members yet</div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="chat" className="h-[calc(100vh-280px)] flex flex-col">
          <div className="scrum-card p-6 flex-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Project Chat</h3>
            
            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              {chatMessages.length > 0 ? (
                chatMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex ${isOwnMessage(msg.userId) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] px-3 py-2 rounded-lg ${
                        isOwnMessage(msg.userId) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      {!isOwnMessage(msg.userId) && (
                        <div className="font-semibold text-xs mb-1">{msg.username}</div>
                      )}
                      <div>{msg.message}</div>
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {formatMessageTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>
            
            <div className="mt-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 rounded-md border border-input bg-background"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isSending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                >
                  <SendHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectTeam;
