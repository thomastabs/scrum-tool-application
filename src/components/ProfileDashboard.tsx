
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountSettings from "./settings/AccountSettings";
import AppSettings from "./settings/AppSettings";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface ProfileDashboardProps {
  user: any;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ user }) => {
  const [open, setOpen] = useState(false);

  const getInitials = (email: string): string => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-9 px-2"
      >
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {getInitials(user?.email)}
          </AvatarFallback>
        </Avatar>
        <span className="sr-only md:not-sr-only text-sm">Profile</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="mt-4">
              <AccountSettings user={user} />
            </TabsContent>
            
            <TabsContent value="appearance" className="mt-4">
              <AppSettings />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileDashboard;
