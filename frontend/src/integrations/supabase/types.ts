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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      areas: {
        Row: {
          id: string
          nome: string
          descricao: string
          icon: string
          cor: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nome: string
          descricao: string
          icon: string
          cor: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string
          icon?: string
          cor?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      demandas: {
        Row: {
          id: number
          titulo: string
          descricao: string | null
          area_id: string | null
          status: Database["public"]["Enums"]["demanda_status"]
          user_id: string
          assignee_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          titulo: string
          descricao?: string | null
          area_id?: string | null
          status?: Database["public"]["Enums"]["demanda_status"]
          user_id: string
          assignee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          titulo?: string
          descricao?: string | null
          area_id?: string | null
          status?: Database["public"]["Enums"]["demanda_status"]
          user_id?: string
          assignee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demandas_area_id_fkey"
            columns: ["area_id"]
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      avisos: {
        Row: {
          id: string
          titulo: string
          resumo: string
          autor: string
          destaque: boolean
          published_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          resumo: string
          autor: string
          destaque?: boolean
          published_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          resumo?: string
          autor?: string
          destaque?: boolean
          published_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      processos: {
        Row: {
          id: string
          titulo: string
          descricao: string | null
          area_id: string | null
          user_id: string | null
          last_accessed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descricao?: string | null
          area_id?: string | null
          user_id?: string | null
          last_accessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descricao?: string | null
          area_id?: string | null
          user_id?: string | null
          last_accessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processos_area_id_fkey"
            columns: ["area_id"]
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          type: Database["public"]["Enums"]["notification_type"]
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          type: Database["public"]["Enums"]["notification_type"]
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          type?: Database["public"]["Enums"]["notification_type"]
          read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      demanda_attachments: {
        Row: {
          id: string
          demanda_id: number
          user_id: string
          bucket_id: string
          storage_path: string
          filename: string
          content_type: string | null
          size_bytes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          demanda_id: number
          user_id: string
          bucket_id?: string
          storage_path: string
          filename: string
          content_type?: string | null
          size_bytes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          demanda_id?: number
          user_id?: string
          bucket_id?: string
          storage_path?: string
          filename?: string
          content_type?: string | null
          size_bytes?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demanda_attachments_demanda_id_fkey"
            columns: ["demanda_id"]
            referencedRelation: "demandas"
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
      demanda_status: "aberto" | "em_andamento" | "concluido" | "cancelado"
      notification_type: "demanda" | "aviso" | "processo"
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      demanda_status: ["aberto", "em_andamento", "concluido", "cancelado"],
      notification_type: ["demanda", "aviso", "processo"],
    },
  },
} as const
