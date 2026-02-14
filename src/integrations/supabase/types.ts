export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      candidates: {
        Row: {
          availability: string
          created_at: string
          cv_url: string | null
          experience: string
          first_name: string
          id: string
          last_name: string
          lead_id: string | null
          name: string
          phone: string | null
          position: string
          stack: string[]
          status: string
          tjm: number
          updated_at: string
        }
        Insert: {
          availability?: string
          created_at?: string
          cv_url?: string | null
          experience?: string
          first_name?: string
          id?: string
          last_name?: string
          lead_id?: string | null
          name?: string
          phone?: string | null
          position?: string
          stack?: string[]
          status?: string
          tjm?: number
          updated_at?: string
        }
        Update: {
          availability?: string
          created_at?: string
          cv_url?: string | null
          experience?: string
          first_name?: string
          id?: string
          last_name?: string
          lead_id?: string | null
          name?: string
          phone?: string | null
          position?: string
          stack?: string[]
          status?: string
          tjm?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          admin_amount: number
          amount: number
          apporteur_id: string
          commission_month: number
          commission_year: number
          created_at: string
          days_worked: number
          id: string
          mission_id: string | null
          percentage: number
          status: string
          updated_at: string
        }
        Insert: {
          admin_amount?: number
          amount?: number
          apporteur_id: string
          commission_month?: number
          commission_year?: number
          created_at?: string
          days_worked?: number
          id?: string
          mission_id?: string | null
          percentage?: number
          status?: string
          updated_at?: string
        }
        Update: {
          admin_amount?: number
          amount?: number
          apporteur_id?: string
          commission_month?: number
          commission_year?: number
          created_at?: string
          days_worked?: number
          id?: string
          mission_id?: string | null
          percentage?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          admin_comment: string | null
          client: string
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          description: string
          duration: string
          hidden_by_user: boolean
          id: string
          location: string
          margin: number
          position: string
          priority: string
          recruiter: string
          remote: string
          sector: string
          seniority: string
          stack: string[]
          start_date: string
          status: string
          tjm: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_comment?: string | null
          client?: string
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          description?: string
          duration?: string
          hidden_by_user?: boolean
          id?: string
          location?: string
          margin?: number
          position?: string
          priority?: string
          recruiter?: string
          remote?: string
          sector?: string
          seniority?: string
          stack?: string[]
          start_date?: string
          status?: string
          tjm?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_comment?: string | null
          client?: string
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          description?: string
          duration?: string
          hidden_by_user?: boolean
          id?: string
          location?: string
          margin?: number
          position?: string
          priority?: string
          recruiter?: string
          remote?: string
          sector?: string
          seniority?: string
          stack?: string[]
          start_date?: string
          status?: string
          tjm?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          apporteur_id: string
          candidate_id: string
          client: string
          consultant_name: string
          created_at: string
          duration: string
          id: string
          lead_id: string
          start_date: string | null
          status: string
          tjm: number
          tjm_client: number
          updated_at: string
        }
        Insert: {
          apporteur_id: string
          candidate_id: string
          client?: string
          consultant_name?: string
          created_at?: string
          duration?: string
          id?: string
          lead_id: string
          start_date?: string | null
          status?: string
          tjm?: number
          tjm_client?: number
          updated_at?: string
        }
        Update: {
          apporteur_id?: string
          candidate_id?: string
          client?: string
          consultant_name?: string
          created_at?: string
          duration?: string
          id?: string
          lead_id?: string
          start_date?: string | null
          status?: string
          tjm?: number
          tjm_client?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_comment: string | null
          blocked: boolean
          company: string | null
          created_at: string
          deleted_at: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_comment?: string | null
          blocked?: boolean
          company?: string | null
          created_at?: string
          deleted_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_comment?: string | null
          blocked?: boolean
          company?: string | null
          created_at?: string
          deleted_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      candidates_safe: {
        Row: {
          availability: string | null
          created_at: string | null
          cv_url: string | null
          experience: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          lead_id: string | null
          name: string | null
          phone: string | null
          position: string | null
          stack: string[] | null
          status: string | null
          tjm: number | null
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          cv_url?: string | null
          experience?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          lead_id?: string | null
          name?: string | null
          phone?: never
          position?: string | null
          stack?: string[] | null
          status?: string | null
          tjm?: number | null
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          cv_url?: string | null
          experience?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          lead_id?: string | null
          name?: string | null
          phone?: never
          position?: string | null
          stack?: string[] | null
          status?: string | null
          tjm?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "apporteur" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["apporteur", "admin"],
    },
  },
} as const
