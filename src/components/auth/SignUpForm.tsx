
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signUp } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { validateEmail, validateUsername, validatePassword, validateConfirmPassword } from "@/utils/validation";
import { checkDatabaseConnection } from "@/lib/db-diagnostic";

type SignUpFormProps = {
  onSuccess: () => void;
};

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<string | null>(null);

  // Check database connection on component mount
  useEffect(() => {
    const verifyDatabaseConnection = async () => {
      const result = await checkDatabaseConnection();
      if (result.status === "error") {
        setDbStatus(`Database issue: ${result.message}`);
        console.error("Database diagnostic:", result);
      }
    };

    verifyDatabaseConnection();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form inputs
    const emailError = validateEmail(email);
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
    
    // If any validation errors, show the first one
    if (emailError || usernameError || passwordError || confirmPasswordError) {
      const errorMessage = emailError || usernameError || passwordError || confirmPasswordError;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      console.log("Starting signup process for:", email);
      
      // Check database connection before attempting signup
      const dbCheck = await checkDatabaseConnection();
      if (dbCheck.status === "error") {
        throw new Error(`Database error: ${dbCheck.message}`);
      }
      
      const { data, error } = await signUp(email, password, username);
      
      if (error) {
        console.error("Sign up error returned:", error);
        
        // Handle specific error cases with more user-friendly messages
        if (error.message.includes("already exists")) {
          setError("A user with this email or username already exists. Try signing in or use different credentials.");
        } else if (error.message.includes("Unable to register") || error.message.includes("System error")) {
          setError("Unable to register at this time. Please try again later or contact support.");
        } else if (error.message.includes("Database setup incomplete")) {
          setError("The application is still initializing. Please try again in a few moments.");
        } else {
          setError(error.message || "An error occurred during signup");
        }
        
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
        toast({
          title: "Sign up successful",
          description: "Your account has been created successfully!"
        });
        onSuccess();
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
    <form onSubmit={handleSignUp} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {dbStatus && (
        <Alert variant="warning">
          <AlertDescription>{dbStatus}</AlertDescription>
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
  );
};

export default SignUpForm;
