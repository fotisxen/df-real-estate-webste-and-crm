// Hand-written to match supabase/schema.sql. If you prefer, once the
// project is linked you can generate this instead with:
//   npx supabase gen types typescript --project-id <ref> > types/database.ts

import type { PropertyDetails } from "@/lib/propertyFields";

export type ListingType = "sale" | "rent";
export type PropertyCategory = "residential" | "commercial" | "land" | "other";
export type PropertyStatus = "available" | "reserved" | "sold" | "rented";

export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: PropertyCategory;
  subcategory: string | null;
  listing_type: ListingType;
  status: PropertyStatus;
  price: number;
  price_negotiable: boolean;
  common_charges_monthly: number | null;
  area_sqm: number | null;
  plot_area_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  year_built: number | null;
  available_from: string | null;
  currently_rented: boolean;
  code: string | null;
  address: string | null;
  region: string | null;
  municipality: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  agent_id: string | null;
  sync_to_spitogatos: boolean;
  published: boolean;
  details: PropertyDetails;
  created_at: string;
  updated_at: string;
}

// Agent-only — kept in a separate table with no public read policy.
export interface PropertyPrivateDetails {
  property_id: string;
  owner_client_id: string | null;
  internal_notes: string | null;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  storage_path: string;
  position: number;
  alt_text: string | null;
  created_at: string;
}

export interface Agent {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  interested_in: string | null;
  agent_id: string | null;
  created_at: string;
}

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  transaction_date: string;
  description: string | null;
  property_id: string | null;
  client_id: string | null;
  agent_id: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: Property;
        Insert: Partial<Property> & Pick<Property, "title" | "slug" | "category" | "listing_type" | "price">;
        Update: Partial<Property>;
      };
      property_images: {
        Row: PropertyImage;
        Insert: Partial<PropertyImage> & Pick<PropertyImage, "property_id" | "storage_path">;
        Update: Partial<PropertyImage>;
      };
      property_private_details: {
        Row: PropertyPrivateDetails;
        Insert: Partial<PropertyPrivateDetails> & Pick<PropertyPrivateDetails, "property_id">;
        Update: Partial<PropertyPrivateDetails>;
      };
      agents: {
        Row: Agent;
        Insert: Partial<Agent> & Pick<Agent, "full_name" | "email">;
        Update: Partial<Agent>;
      };
      clients: {
        Row: Client;
        Insert: Partial<Client> & Pick<Client, "full_name">;
        Update: Partial<Client>;
      };
      transactions: {
        Row: Transaction;
        Insert: Partial<Transaction> & Pick<Transaction, "type" | "category" | "amount">;
        Update: Partial<Transaction>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
