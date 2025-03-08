
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signUp, getSession } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already signed in
  useEffect(() => {
    const checkSession = async () => {
      const { session, error } = await getSession();
      if (session) {
        navigate("/", { replace: true });
      }
    };

    checkSession();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password || !username) {
      setError("Please enter email, username and password");
      toast({
        title: "Error",
        description: "Please enter email, username and password",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      toast({
        title: "Error",
        description: "Password should be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    
    if (username.length < 3) {
      setError("Username should be at least 3 characters");
      toast({
        title: "Error",
        description: "Username should be at least 3 characters",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      console.log("Starting signup process for:", email);
      const { data, error } = await signUp(email, password, username);
      
      if (error) {
        console.error("Sign up error returned:", error);
        setError(error.message || "An error occurred during signup");
        toast({
          title: "Sign up failed",
          description: error.message || "An error occurred during signup",
          variant: "destructive"
        });
      } else if (!data?.user) {
        // Handle case where no error but also no user data returned
        console.warn("No user data returned from signup but no error");
        setError("Account could not be created. Please try again later.");
        toast({
          title: "Sign up failed",
          description: "Account could not be created. Please try again later.",
          variant: "destructive"
        });
      } else {
        console.log("Signup completed successfully");
        setSuccess(true);
        toast({
          title: "Sign up successful",
          description: "Your account has been created successfully!"
        });
        // Navigate to dashboard after successful signup
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Unexpected client-side error during signup:", err);
      const errorMessage = err?.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
              Sign up to start managing your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <Alert>
                <AlertDescription className="text-center py-4">
                  <p className="mb-4">Account created successfully!</p>
                  <p>Redirecting you to the dashboard...</p>
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe" 
                    required
                  />
                  <p className="text-xs text-muted-foreground">Must be at least 3 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing up...' : 'Sign Up'}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/sign-in" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="border-t p-4 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Agile Sprint Manager. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default SignUp;
