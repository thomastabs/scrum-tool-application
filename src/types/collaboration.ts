
export interface Collaborator {
  id: string;
  projectId: string;
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
  createdAt: Date;
  userEmail?: string; // For display purposes
}

export interface Invitation {
  id: string;
  projectId: string;
  invitedEmail: string;
  role: 'viewer' | 'editor' | 'admin';
  inviterId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
  projectTitle?: string; // For display purposes
  inviterEmail?: string; // For display purposes
}

export interface InvitationFormData {
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  projectId: string;
}
