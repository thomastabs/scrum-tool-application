export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      board_columns: {
        Row: {
          created_at: string
          id: string
          order_index: number
          sprint_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index: number
          sprint_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          sprint_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_columns_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborators: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          id: string
          invited_email: string
          inviter_id: string
          project_id: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_email: string
          inviter_id: string
          project_id: string
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_email?: string
          inviter_id?: string
          project_id?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      sprints: {
        Row: {
          created_at: string
          description: string | null
          duration: number
          end_date: string
          id: string
          justification: string | null
          project_id: string
          start_date: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration: number
          end_date: string
          id?: string
          justification?: string | null
          project_id: string
          start_date: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number
          end_date?: string
          id?: string
          justification?: string | null
          project_id?: string
          start_date?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee: string | null
          column_id: string | null
          created_at: string
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          project_id: string | null
          sprint_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          story_points: number | null
          title: string
          user_id: string
        }
        Insert: {
          assignee?: string | null
          column_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string | null
          sprint_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          story_points?: number | null
          title: string
          user_id: string
        }
        Update: {
          assignee?: string | null
          column_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string | null
          sprint_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          story_points?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "board_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      sprint_status: "active" | "completed"
      task_priority: "low" | "medium" | "high"
      task_status: "todo" | "in-progress" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
