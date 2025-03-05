
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { searchUsers, inviteUserToProject } from "@/lib/supabase";
import { Project } from "@/types";

interface InviteUserFormProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserSearchResult {
  id: string;
  email: string;
  display_name?: string;
}

const InviteUserForm: React.FC<InviteUserFormProps> = ({ 
  project, 
  open, 
  onOpenChange 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("viewer");
  
  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) {
      toast({
        title: "Search query too short",
        description: "Please enter at least 3 characters to search",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    const { data, error } = await searchUsers(searchQuery.trim());
    setLoading(false);
    
    if (error) {
      toast({
        title: "Error searching users",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    setSearchResults(data || []);
    
    if (!data || data.length === 0) {
      toast({
        title: "No users found",
        description: "Try a different search term"
      });
    }
  };
  
  const handleSubmit = async () => {
    if (!selectedUser) {
      toast({
        title: "No user selected",
        description: "Please select a user to invite",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    const { error } = await inviteUserToProject(project.id, selectedUser.id, role);
    setLoading(false);
    
    if (error) {
      toast({
        title: "Error inviting user",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "User invited",
      description: `An invitation has been sent to ${selectedUser.email}`
    });
    
    // Reset form and close dialog
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User to Project</DialogTitle>
          <DialogDescription>
            Search for users by email and invite them to collaborate on "{project.title}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Search users by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading || searchQuery.trim().length < 3}
            >
              Search
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
              {searchResults.map((user) => (
                <div 
                  key={user.id} 
                  className={`p-2 cursor-pointer rounded hover:bg-accent ${
                    selectedUser?.id === user.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="font-medium">{user.email}</div>
                  {user.display_name && (
                    <div className="text-sm text-muted-foreground">{user.display_name}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-3 border rounded-md bg-accent/20">
                <p className="text-sm font-medium">Selected User</p>
                <p>{selectedUser.email}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !selectedUser}
          >
            Invite User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserForm;
