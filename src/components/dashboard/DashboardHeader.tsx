
import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Moon, Sun } from "lucide-react";
import ProfileButton from "@/components/auth/ProfileButton";

const DashboardHeader = () => {
  const { theme, setTheme } = useTheme();
  const { profile } = useAuth();

  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {profile ? `Welcome ${profile.full_name} (${profile.role.replace('_', ' ')})` : 'Welcome to your Agile Sprint Manager dashboard'}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </Button>
        <ProfileButton />
      </div>
    </header>
  );
};

export default DashboardHeader;
