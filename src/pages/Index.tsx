import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut, getSession, supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { UserRound, LogOut } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { session } = await getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out successfully"
      });
      navigate("/sign-in");
    }
  };

  const navigateToProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between py-3">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-check-square">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <h1 className="text-xl font-bold">Agile Sprint Manager</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={navigateToProfile}
              title="Profile Settings"
            >
              <UserRound className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="product-backlog" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="product-backlog">Product Backlog</TabsTrigger>
                <TabsTrigger value="sprints">Sprints</TabsTrigger>
              </TabsList>
              <TabsContent value="product-backlog">
                <div className="mt-6">
                  {/* Product Backlog Content */}
                  <p>Product Backlog will go here</p>
                </div>
              </TabsContent>
              <TabsContent value="sprints">
                <div className="mt-6">
                  {/* Sprints Content */}
                  <p>Sprints will go here</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-4 bg-background">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Agile Sprint Manager. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
