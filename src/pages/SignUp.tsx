
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSession } from "@/lib/supabase";
import AuthLayout from "@/components/auth/AuthLayout";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUp: React.FC = () => {
  const [success, setSuccess] = useState(false);
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

  const handleSignUpSuccess = () => {
    setSuccess(true);
    // Navigate to dashboard after successful signup
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <AuthLayout title="Create an Account" description="Sign up to start managing your projects">
      <Card>
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
            <SignUpForm onSuccess={handleSignUpSuccess} />
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default SignUp;
