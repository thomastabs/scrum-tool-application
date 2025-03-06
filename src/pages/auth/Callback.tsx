
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth or email confirmation callback
    const handleAuthCallback = async () => {
      // Get the hash fragment from URL (contains access_token, etc.)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      
      if (accessToken) {
        // If hash contains access_token, it's an OAuth callback
        // We don't need to do anything specific here as Supabase client
        // will handle the session automatically
        navigate("/");
      } else {
        // Check if this is an email confirmation
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          navigate("/auth/sign-in");
        } else {
          navigate("/");
        }
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Processing authentication...</h2>
        <p>Please wait while we confirm your identity.</p>
      </div>
    </div>
  );
};

export default Callback;
