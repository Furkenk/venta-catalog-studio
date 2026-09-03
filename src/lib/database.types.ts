export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type CatalogRole = 'manager' | 'admin';
export type CatalogStatus = 'draft' | 'published' | 'archived';
export type CatalogVisibility = 'public' | 'unlisted' | 'password';

export interface Database {
  public: {
    Tables: {
      catalog_members: {
        Row: { user_id: string; role: CatalogRole; full_name: string | null; created_at: string; updated_at: string };
        Insert: { user_id: string; role?: CatalogRole; full_name?: string | null; created_at?: string; updated_at?: string };
        Update: { role?: CatalogRole; full_name?: string | null; updated_at?: string };
      };
      catalogs: {
        Row: { id: string; catalog_number: number; code: string | null; title: string; slug: string; owner_id: string; status: CatalogStatus; visibility: CatalogVisibility; password_hash: string | null; cover_image_url: string | null; settings: Json; published_at: string | null; archived_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; catalog_number?: number; code?: string | null; title: string; slug: string; owner_id: string; status?: CatalogStatus; visibility?: CatalogVisibility; password_hash?: string | null; cover_image_url?: string | null; settings?: Json; published_at?: string | null; archived_at?: string | null; created_at?: string; updated_at?: string };
        Update: { title?: string; slug?: string; status?: CatalogStatus; visibility?: CatalogVisibility; password_hash?: string | null; cover_image_url?: string | null; settings?: Json; published_at?: string | null; archived_at?: string | null; updated_at?: string };
      };
      catalog_pages: {
        Row: { id: string; catalog_id: string; page_number: number; is_locked: boolean; layout_key: string; layout_config: Json; settings_override: Json; created_at: string; updated_at: string };
        Insert: { id?: string; catalog_id: string; page_number: number; is_locked?: boolean; layout_key?: string; layout_config?: Json; settings_override?: Json; created_at?: string; updated_at?: string };
        Update: { page_number?: number; is_locked?: boolean; layout_key?: string; layout_config?: Json; settings_override?: Json; updated_at?: string };
      };
      catalog_slots: {
        Row: { id: string; page_id: string; slot_index: number; shopify_product_id: string | null; product_handle: string | null; product_url: string | null; product_snapshot: Json; frame_config: Json; image_transform: Json; qr_config: Json; meta_visibility: Json; created_at: string; updated_at: string };
        Insert: { id?: string; page_id: string; slot_index: number; shopify_product_id?: string | null; product_handle?: string | null; product_url?: string | null; product_snapshot?: Json; frame_config?: Json; image_transform?: Json; qr_config?: Json; meta_visibility?: Json; created_at?: string; updated_at?: string };
        Update: { slot_index?: number; shopify_product_id?: string | null; product_handle?: string | null; product_url?: string | null; product_snapshot?: Json; frame_config?: Json; image_transform?: Json; qr_config?: Json; meta_visibility?: Json; updated_at?: string };
      };
      catalog_custom_layouts: {
        Row: { id: string; user_id: string; name: string; layout_config: Json; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; name: string; layout_config: Json; created_at?: string; updated_at?: string };
        Update: { name?: string; layout_config?: Json; updated_at?: string };
      };
    };
    Views: Record<string, never>;
    Functions: { is_catalog_manager: { Args: Record<string, never>; Returns: boolean } };
    Enums: { catalog_role: CatalogRole; catalog_status: CatalogStatus; catalog_visibility: CatalogVisibility };
    CompositeTypes: Record<string, never>;
  };
}
