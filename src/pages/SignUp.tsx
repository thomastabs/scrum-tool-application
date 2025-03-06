
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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    setErrorMessage(null);
    
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match");
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage("Password should be at least 6 characters");
      toast({
        title: "Error",
        description: "Password should be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await signUp(email, password);
      
      if (error) {
        console.error("Sign up error:", error);
        
        // More specific error messages
        if (error.message.includes("already registered")) {
          setErrorMessage("This email is already registered. Please use a different email or try signing in.");
        } else {
          setErrorMessage(error.message);
        }
        
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (data?.user && !data.session) {
        // Email verification required
        setVerificationSent(true);
        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your account."
        });
      } else if (data?.session) {
        // In case email verification is disabled in Supabase
        toast({
          title: "Sign up successful",
          description: "Your account has been created. You are now signed in."
        });
        navigate("/");
      } else {
        // Unexpected response format
        setErrorMessage("Unexpected response from server. Please try again.");
        console.error("Unexpected sign up response:", data);
      }
    } catch (err: any) {
      console.error("Unexpected error during sign up:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
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
            {errorMessage && (
              <Alert className="mb-4 border-destructive/50 text-destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {verificationSent ? (
              <div className="text-center space-y-4">
                <Alert className="mb-4 border-green-100 bg-green-50 text-green-800">
                  <AlertDescription>
                    A verification email has been sent to <strong>{email}</strong>. 
                    Please check your inbox and click the link to verify your account.
                  </AlertDescription>
                </Alert>
                
                <p className="text-sm text-muted-foreground mt-4">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                
                <div className="flex justify-center mt-4 space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setVerificationSent(false)}
                  >
                    Try again
                  </Button>
                  <Button 
                    onClick={() => navigate("/sign-in")}
                  >
                    Go to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
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
