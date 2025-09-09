-- 1. Drop existing objects to ensure a clean slate (Idempotent Script)
DROP POLICY IF EXISTS "Allow authenticated users to manage services" ON public.services;
DROP POLICY IF EXISTS "Enable read access for all users on services" ON public.services;
DROP POLICY IF EXISTS "Allow authenticated users to manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Enable read access for all users on appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow authenticated users to manage clients" ON public.clients;
DROP POLICY IF EXISTS "Enable read access for all users on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow user to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.profiles;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

DROP TABLE IF EXISTS public.appointments;
DROP TABLE IF EXISTS public.services;
DROP TABLE IF EXISTS public.clients;
DROP TABLE IF EXISTS public.profiles;

-- 2. Create Tables

-- Table for User Profiles
-- This table will be populated automatically by a trigger when a new user signs up.
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name character varying,
    email character varying,
    role text,
    permissions jsonb
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Table for Clients
CREATE TABLE public.clients (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    whatsapp character varying,
    telegram character varying,
    avatarUrl text,
    email character varying,
    admin character varying
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Table for Services
CREATE TABLE public.services (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    duration character varying,
    price numeric,
    icon character varying
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Table for Appointments
CREATE TABLE public.appointments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
    service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
    admin_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    date_time timestamp with time zone NOT NULL,
    notes text,
    status character varying
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;


-- 3. Create Function and Trigger for New User Automation

-- This function is triggered when a new user signs up.
-- It inserts a new row into public.profiles, copying the id, email, and name from the auth.users table.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, permissions)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'Midgard', '{}'::jsonb);
  return new;
end;
$$;

-- This trigger calls the handle_new_user function after a new user is created in the auth.users table.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4. Set up Row Level Security (RLS) Policies

-- PROFILES Table Policies
CREATE POLICY "Enable read access for all users on profiles" ON "public"."profiles"
AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Allow user to update own profile" ON "public"."profiles"
AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = id));
CREATE POLICY "Enable insert for all users" ON "public"."profiles"
AS PERMISSIVE FOR INSERT TO public WITH CHECK (true); -- Required for the trigger to work


-- CLIENTS Table Policies
CREATE POLICY "Enable read access for all users on clients" ON "public"."clients"
AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage clients" ON "public"."clients"
AS PERMISSIVE FOR ALL TO authenticated USING (true);


-- SERVICES Table Policies
CREATE POLICY "Enable read access for all users on services" ON "public"."services"
AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage services" ON "public"."services"
AS PERMISSIVE FOR ALL TO authenticated USING (true);


-- APPOINTMENTS Table Policies
CREATE POLICY "Enable read access for all users on appointments" ON "public"."appointments"
AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage appointments" ON "public"."appointments"
AS PERMISSIVE FOR ALL TO authenticated USING (true);
