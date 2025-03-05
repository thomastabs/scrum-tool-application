
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddColumnProps {
  onAddColumn: (name: string) => void;
}

const AddColumn: React.FC<AddColumnProps> = ({ onAddColumn }) => {
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      onAddColumn(newColumnName.trim());
      setNewColumnName("");
      setShowAddColumn(false);
    }
  };

  if (!showAddColumn) {
    return (
      <div 
        className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setShowAddColumn(true)}
      >
        <div className="flex flex-col items-center">
          <Plus className="h-5 w-5 mb-1 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Add Column</span>
        </div>
      </div>
    );
  }

  return (
    <div className="board-column border rounded-lg p-4 bg-background">
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Column name"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleAddColumn}>
            Add
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setShowAddColumn(false);
              setNewColumnName("");
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddColumn;
