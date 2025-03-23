
import React, { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import ProjectChat from "./ProjectChat";

const ProjectChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Close chat with escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);
  
  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-30 p-3 rounded-full shadow-lg transition-all ${
          isOpen ? 'bg-destructive rotate-90' : 'bg-scrum-accent'
        }`}
        title={isOpen ? "Close chat" : "Open project chat"}
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </button>
      
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-20 w-80 md:w-96 shadow-xl animate-fade-up">
          <ProjectChat />
        </div>
      )}
    </>
  );
};

export default ProjectChatButton;
