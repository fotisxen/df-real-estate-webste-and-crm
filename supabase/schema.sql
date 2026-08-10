-- Run this in the Supabase SQL editor (or via `supabase db push` once you
-- have the CLI linked to your project). See README.md for setup order.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Agents (the 1-2 agency staff who log in to /admin)
-- ---------------------------------------------------------------------
create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Properties (public listings)
-- ---------------------------------------------------------------------
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  property_type text not null check (property_type in ('house','apartment','office','commercial','land')),
  listing_type text not null check (listing_type in ('sale','rent')),
  status text not null default 'available' check (status in ('available','reserved','sold','rented')),
  price numeric(12,2) not null,
  area_sqm numeric(8,2),
  bedrooms int,
  bathrooms int,
  year_built int,
  address text,
  region text,
  lat double precision,
  lng double precision,
  agent_id uuid references agents(id) on delete set null,
  sync_to_spitogatos boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_listing_type_idx on properties(listing_type);
create index if not exists properties_status_idx on properties(status);
create index if not exists properties_region_idx on properties(region);

create table if not exists property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null, -- path inside the "property-images" storage bucket
  position int not null default 0,
  alt_text text,
  created_at timestamptz not null default now()
);

create index if not exists property_images_property_id_idx on property_images(property_id);

-- ---------------------------------------------------------------------
-- Clients — PRIVATE. Only authenticated agency staff can read/write this.
-- This table is what "only they will see" means at the database level:
-- even if someone got the anon key, RLS below blocks all access unless
-- they're signed in as an agent.
-- ---------------------------------------------------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  address text,
  notes text,
  interested_in text, -- free text: e.g. "3br house, Kalamaria, up to 250k"
  agent_id uuid references agents(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table clients add column if not exists address text;
-- Superseded by the owner_client_id link on property_private_details:
-- a client "is an owner" simply by having a property linked to them.
alter table clients drop column if exists is_owner;

-- ---------------------------------------------------------------------
-- updated_at trigger for properties
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists properties_set_updated_at on properties;
create trigger properties_set_updated_at
  before update on properties
  for each row execute procedure set_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table properties enable row level security;
alter table property_images enable row level security;
alter table clients enable row level security;
alter table agents enable row level security;

-- Public site: anyone can read properties/images. Only signed-in agents
-- can write. "Signed-in agent" = any authenticated Supabase user, since
-- only the 1-2 staff accounts will ever exist in this project's auth.
drop policy if exists "properties are publicly readable" on properties;
create policy "properties are publicly readable"
  on properties for select
  using (true);

drop policy if exists "only agents can modify properties" on properties;
create policy "only agents can modify properties"
  on properties for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "property images are publicly readable" on property_images;
create policy "property images are publicly readable"
  on property_images for select
  using (true);

drop policy if exists "only agents can modify property images" on property_images;
create policy "only agents can modify property images"
  on property_images for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Clients: NO public policy at all. Only authenticated agents get
-- access, in either direction. This is the private CRM data.
drop policy if exists "only agents can read clients" on clients;
create policy "only agents can read clients"
  on clients for select
  using (auth.role() = 'authenticated');

drop policy if exists "only agents can modify clients" on clients;
create policy "only agents can modify clients"
  on clients for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Agents table: agents can read the staff list (for assigning listings/
-- clients to a colleague) but not modify it from the app — add new staff
-- via the Supabase dashboard so it's a deliberate action, not a form.
drop policy if exists "agents can read agent list" on agents;
create policy "agents can read agent list"
  on agents for select
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- Storage bucket for property photos.
-- Create the bucket itself in the Supabase dashboard (Storage -> New
-- bucket -> name "property-images" -> Public bucket = ON), then run
-- these policies so only agents can upload/delete.
-- ---------------------------------------------------------------------
-- insert into storage.buckets (id, name, public) values ('property-images', 'property-images', true)
--   on conflict (id) do nothing;
--
-- create policy "public read of property images"
--   on storage.objects for select
--   using (bucket_id = 'property-images');
--
-- create policy "agents can upload property images"
--   on storage.objects for insert
--   with check (bucket_id = 'property-images' and auth.role() = 'authenticated');
--
-- create policy "agents can delete property images"
--   on storage.objects for delete
--   using (bucket_id = 'property-images' and auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- Extended listing fields. Re-runnable: safe on both a fresh install
-- (right after the create table above) and an existing database.
-- `property_type` is replaced by category/subcategory; the long tail of
-- optional attributes (floor, heating, amenities, ...) lives in `details`
-- as JSON rather than as ~80 individual columns, since almost none of
-- them are required per listing and the set may keep growing — see
-- lib/propertyFields.ts for the field definitions that read/write it.
-- ---------------------------------------------------------------------
alter table properties drop constraint if exists properties_property_type_check;
alter table properties drop column if exists property_type;

alter table properties add column if not exists category text
  check (category in ('residential','commercial','land','other'));
alter table properties add column if not exists subcategory text;
alter table properties add column if not exists code text;
alter table properties add column if not exists common_charges_monthly numeric(10,2);
alter table properties add column if not exists price_negotiable boolean not null default false;
alter table properties add column if not exists plot_area_sqm numeric(10,2);
alter table properties add column if not exists available_from date;
alter table properties add column if not exists currently_rented boolean not null default false;
alter table properties add column if not exists municipality text;
alter table properties add column if not exists neighborhood text;
alter table properties add column if not exists details jsonb not null default '{}'::jsonb;
alter table properties add column if not exists published boolean not null default true;

create index if not exists properties_category_idx on properties(category);

-- Owner/notes on a listing are private CRM data, same as `clients` —
-- kept in their own table so the public read policy on `properties`
-- (which covers all its columns) can never expose them.
create table if not exists property_private_details (
  property_id uuid primary key references properties(id) on delete cascade,
  owner_client_id uuid references clients(id) on delete set null,
  internal_notes text,
  updated_at timestamptz not null default now()
);

-- The real/exact address (as opposed to `properties.address`, which is the
-- approximate address shown to the public — same privacy split as
-- `internal_notes`, never exposed by the public properties select policy).
alter table property_private_details add column if not exists real_address text;

alter table property_private_details enable row level security;

drop policy if exists "only agents can read property private details" on property_private_details;
create policy "only agents can read property private details"
  on property_private_details for select
  using (auth.role() = 'authenticated');

drop policy if exists "only agents can modify property private details" on property_private_details;
create policy "only agents can modify property private details"
  on property_private_details for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop trigger if exists property_private_details_set_updated_at on property_private_details;
create trigger property_private_details_set_updated_at
  before update on property_private_details
  for each row execute procedure set_updated_at();

-- ---------------------------------------------------------------------
-- Transactions — simple income/expense ledger for the agency's own
-- finances (commissions earned, marketing spend, office costs, ...).
-- PRIVATE, same as clients: no public policy at all.
-- ---------------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income','expense')),
  category text not null,
  amount numeric(12,2) not null check (amount > 0),
  transaction_date date not null default current_date,
  description text,
  property_id uuid references properties(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  agent_id uuid references agents(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists transactions_date_idx on transactions(transaction_date desc);
create index if not exists transactions_type_idx on transactions(type);
create index if not exists transactions_property_id_idx on transactions(property_id);
create index if not exists transactions_client_id_idx on transactions(client_id);

alter table transactions enable row level security;

drop policy if exists "only agents can read transactions" on transactions;
create policy "only agents can read transactions"
  on transactions for select
  using (auth.role() = 'authenticated');

drop policy if exists "only agents can modify transactions" on transactions;
create policy "only agents can modify transactions"
  on transactions for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
