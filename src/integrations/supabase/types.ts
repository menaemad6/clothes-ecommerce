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
      addresses: {
        Row: {
          city: string
          created_at: string | null
          id: string
          is_default: boolean | null
          line1: string
          line2: string | null
          name: string
          postal_code: string
          state: string
          user_id: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          line1: string
          line2?: string | null
          name: string
          postal_code: string
          state: string
          user_id?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          line1?: string
          line2?: string | null
          name?: string
          postal_code?: string
          state?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image?: string
          name?: string
        }
        Relationships: []
      }
      delivery_slots: {
        Row: {
          available: boolean | null
          created_at: string | null
          date: string
          id: string
          time_slot: string
        }
        Insert: {
          available?: boolean | null
          created_at?: string | null
          date: string
          id?: string
          time_slot: string
        }
        Update: {
          available?: boolean | null
          created_at?: string | null
          date?: string
          id?: string
          time_slot?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          price_at_time: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          id?: string
          order_id?: string | null
          price_at_time: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string | null
          price_at_time?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_items_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string | null
          billing_address: string | null
          created_at: string | null
          delivery_slot_id: string | null
          id: string
          order_notes: string | null
          payment_method: string | null
          shipping_address: string | null
          status: string
          total: number
          user_id: string | null
        }
        Insert: {
          address_id?: string | null
          billing_address?: string | null
          created_at?: string | null
          delivery_slot_id?: string | null
          id?: string
          order_notes?: string | null
          payment_method?: string | null
          shipping_address?: string | null
          status: string
          total: number
          user_id?: string | null
        }
        Update: {
          address_id?: string | null
          billing_address?: string | null
          created_at?: string | null
          delivery_slot_id?: string | null
          id?: string
          order_notes?: string | null
          payment_method?: string | null
          shipping_address?: string | null
          status?: string
          total?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_slot_id_fkey"
            columns: ["delivery_slot_id"]
            isOneToOne: false
            referencedRelation: "delivery_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string
          created_at: string | null
          description: string
          discount: number | null
          featured: boolean | null
          id: string
          image: string
          is_new: boolean | null
          name: string
          original_price: number | null
          price: number
          stock: number
          unit: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description: string
          discount?: number | null
          featured?: boolean | null
          id?: string
          image: string
          is_new?: boolean | null
          name: string
          original_price?: number | null
          price: number
          stock: number
          unit: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string
          discount?: number | null
          featured?: boolean | null
          id?: string
          image?: string
          is_new?: boolean | null
          name?: string
          original_price?: number | null
          price?: number
          stock?: number
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          updated_at: string | null
          phone_number: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
          phone_number?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          phone_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_wishlists_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_highest_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          user_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "admin" | "super_admin"
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
    Enums: {
      user_role: ["user", "admin", "super_admin"],
    },
  },
} as const
