
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const AppSettings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Appearance</CardTitle>
        <CardDescription>Customize how the application looks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {theme === 'dark' ? 
                <Moon className="h-5 w-5 text-indigo-400" /> : 
                <Sun className="h-5 w-5 text-amber-500" />
              }
              <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-indigo-400' : 'text-muted-foreground'}`}>
              {theme === 'dark' ? 'On' : 'Off'}
            </span>
          </div>
          <Switch
            id="dark-mode"
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppSettings;
