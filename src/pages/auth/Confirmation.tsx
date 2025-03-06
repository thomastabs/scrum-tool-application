
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

const Confirmation = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We've sent you a confirmation link to complete your registration
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <div className="rounded-full bg-primary/10 p-6 mb-6">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <p className="text-center text-muted-foreground mb-6">
            Please check your email inbox and click the provided link to confirm your account.
            If you don't see the email, check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild variant="outline" className="w-full">
            <Link to="/auth/sign-in">Return to sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Confirmation;
