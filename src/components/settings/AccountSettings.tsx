
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface AccountSettingsProps {
  user: any;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const updateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter a new email address",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingEmail(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ email });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Check your new email for a confirmation link",
      });
      
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Error updating email",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Your password has been updated",
      });
      
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Email Address</CardTitle>
          <CardDescription>Update your email address</CardDescription>
        </CardHeader>
        <form onSubmit={updateEmail}>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="current-email">Current Email</Label>
              <Input id="current-email" value={user?.email} disabled />
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="new-email">New Email</Label>
              <Input 
                id="new-email" 
                type="email" 
                placeholder="Enter new email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isUpdatingEmail || !email}
            >
              {isUpdatingEmail ? "Updating..." : "Update Email"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <form onSubmit={updatePassword}>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                placeholder="New password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="Confirm new password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isUpdatingPassword || !password || !confirmPassword}
            >
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AccountSettings;
