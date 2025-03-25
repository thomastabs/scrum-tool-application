
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { fetchProjectCollaborators } from "@/lib/supabase";
import { Users, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { Collaborator } from "@/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Cache storage for collaborators data
const collaboratorsCache = new Map();

// Page size for collaborators pagination
const PAGE_SIZE = 5;

const ProjectTeam: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject } = useProjects();
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [owner, setOwner] = useState<{id: string, username: string, email?: string} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const project = getProject(projectId || "");
  
  useEffect(() => {
    const loadCollaborators = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      try {
        // Check cache first before making API call
        const cacheKey = `collaborators-${projectId}`;
        if (collaboratorsCache.has(cacheKey)) {
          console.log('Using cached collaborators data');
          setCollaborators(collaboratorsCache.get(cacheKey));
        } else {
          // Get collaborators - with optimized field selection
          const collaboratorsData = await fetchProjectCollaborators(projectId);
          setCollaborators(collaboratorsData);
          
          // Store in cache with a 5-minute expiry
          collaboratorsCache.set(cacheKey, collaboratorsData);
          setTimeout(() => {
            collaboratorsCache.delete(cacheKey);
          }, 5 * 60 * 1000); // 5 minutes
        }
        
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
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">Loading team information...</div>
      </div>
    );
  }
  
  const totalPages = Math.ceil(collaborators.length / PAGE_SIZE);
  const paginatedCollaborators = collaborators.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
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
  
  const renderPaginationLinks = () => {
    const links = [];
    
    for (let i = 1; i <= totalPages; i++) {
      links.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return links;
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Team</h2>
      
      <div className="space-y-4">
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCollaborators.map(collab => (
                    <TableRow key={collab.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-accent/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold">{collab.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <span>{collab.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block ${getRoleBadgeClass(collab.role)}`}>
                          {collab.role === 'scrum_master' ? 'Scrum Master' : 
                           collab.role === 'product_owner' ? 'Product Owner' : 
                           'Team Member'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {collab.email && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{collab.email}</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                        </PaginationItem>
                      )}
                      
                      {renderPaginationLinks()}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-muted-foreground">No team members yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectTeam;
