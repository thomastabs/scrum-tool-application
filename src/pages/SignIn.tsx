
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn, resendConfirmationEmail, getSession } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
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

  const handleResendVerification = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }
    
    setIsResendingEmail(true);
    
    try {
      const { error } = await resendConfirmationEmail(email);
      
      if (error) {
        console.error("Error resending verification:", error);
        setErrorMessage(`Failed to resend verification: ${error.message}`);
        toast({
          title: "Error",
          description: `Failed to resend verification: ${error.message}`,
          variant: "destructive"
        });
      } else {
        setErrorMessage(null);
        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification link"
        });
      }
    } catch (err) {
      console.error("Error resending verification:", err);
      setErrorMessage("An unexpected error occurred");
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setNeedsVerification(false);
    
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error("Sign in error:", error);
        
        // Handle email verification errors
        if (error.message.includes("Email not confirmed")) {
          setNeedsVerification(true);
          setErrorMessage("Your email has not been verified. Please check your inbox for a verification link or request a new one.");
        } else if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("The email or password you entered is incorrect.");
        } else {
          setErrorMessage(error.message);
        }
        
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (data?.session) {
        toast({
          title: "Signed in successfully",
          description: "Welcome back!"
        });
        navigate("/");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
        console.error("Unexpected sign in response:", data);
      }
    } catch (err: any) {
      console.error("Unexpected error during sign in:", err);
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
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert className="mb-4 border-destructive/50 text-destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {needsVerification ? (
              <div className="space-y-4">
                <Alert className="mb-4 border-yellow-100 bg-yellow-50 text-yellow-800">
                  <AlertDescription>
                    Your email address needs to be verified before you can sign in.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <Button 
                    onClick={handleResendVerification} 
                    className="w-full"
                    disabled={isResendingEmail}
                  >
                    {isResendingEmail ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNeedsVerification(false);
                      setErrorMessage(null);
                    }}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4">
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
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/sign-up" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
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

export default SignIn;
