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
      analysis_history: {
        Row: {
          article_text: string
          confidence_score: number | null
          created_at: string
          explanation: string | null
          id: string
          key_factors: string[] | null
          prediction: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          article_text: string
          confidence_score?: number | null
          created_at?: string
          explanation?: string | null
          id?: string
          key_factors?: string[] | null
          prediction: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          article_text?: string
          confidence_score?: number | null
          created_at?: string
          explanation?: string | null
          id?: string
          key_factors?: string[] | null
          prediction?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      custom_models: {
        Row: {
          created_at: string
          description: string | null
          download_status: string | null
          error_message: string | null
          id: string
          is_active: boolean | null
          model_id: string
          model_name: string
          model_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_status?: string | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          model_id: string
          model_name: string
          model_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          download_status?: string | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          model_id?: string
          model_name?: string
          model_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          article_text: string
          confidence_score: number | null
          created_at: string
          id: string
          model_prediction: string
          user_feedback: string | null
          user_id: string | null
          user_rating: number | null
        }
        Insert: {
          article_text: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          model_prediction: string
          user_feedback?: string | null
          user_id?: string | null
          user_rating?: number | null
        }
        Update: {
          article_text?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          model_prediction?: string
          user_feedback?: string | null
          user_id?: string | null
          user_rating?: number | null
        }
        Relationships: []
      }
      feedback_training: {
        Row: {
          article_text: string
          confidence_score: number | null
          confidence_vs_rating: number | null
          created_at: string
          feedback_id: string
          id: string
          model_prediction: string
          model_type: string | null
          prediction_accuracy: string | null
          processed_for_training: boolean | null
          text_features: Json | null
          training_weight: number | null
          updated_at: string
          user_feedback: string | null
          user_id: string
          user_rating: number
        }
        Insert: {
          article_text: string
          confidence_score?: number | null
          confidence_vs_rating?: number | null
          created_at?: string
          feedback_id: string
          id?: string
          model_prediction: string
          model_type?: string | null
          prediction_accuracy?: string | null
          processed_for_training?: boolean | null
          text_features?: Json | null
          training_weight?: number | null
          updated_at?: string
          user_feedback?: string | null
          user_id: string
          user_rating: number
        }
        Update: {
          article_text?: string
          confidence_score?: number | null
          confidence_vs_rating?: number | null
          created_at?: string
          feedback_id?: string
          id?: string
          model_prediction?: string
          model_type?: string | null
          prediction_accuracy?: string | null
          processed_for_training?: boolean | null
          text_features?: Json | null
          training_weight?: number | null
          updated_at?: string
          user_feedback?: string | null
          user_id?: string
          user_rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "feedback_training_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          request_count: number | null
          user_id: string | null
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          ai_model_type: string
          api_key: string | null
          created_at: string
          custom_endpoint: string | null
          id: string
          transformer_model: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model_type?: string
          api_key?: string | null
          created_at?: string
          custom_endpoint?: string | null
          id?: string
          transformer_model?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model_type?: string
          api_key?: string | null
          created_at?: string
          custom_endpoint?: string | null
          id?: string
          transformer_model?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
