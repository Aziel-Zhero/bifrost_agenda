-- Drop existing objects to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP TABLE IF EXISTS public.appointments;
DROP TABLE IF EXISTS public.services;
DROP TABLE IF EXISTS public.clients;
DROP TABLE IF EXISTS public.profiles;

-- 1. PROFILES TABLE
-- This table stores user data. It's linked to the auth.users table.
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'Midgard',
  permissions JSONB
);
COMMENT ON TABLE public.profiles IS 'Stores public-facing profile information for each user.';

-- 2. CLIENTS TABLE
-- This table stores client information.
CREATE TABLE public.clients (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    telegram TEXT,
    "avatarUrl" TEXT,
    email TEXT,
    admin TEXT
);
COMMENT ON TABLE public.clients IS 'Stores information about the studio''s clients.';


-- 3. SERVICES TABLE
-- This table stores the services offered by the studio.
CREATE TABLE public.services (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    duration TEXT,
    price NUMERIC,
    icon TEXT
);
COMMENT ON TABLE public.services IS 'Stores the different services offered.';

-- 4. APPOINTMENTS TABLE
-- This table stores appointment information, linking clients and services.
CREATE TABLE public.appointments (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    date_time TIMESTAMPTZ NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Agendado'
);
COMMENT ON TABLE public.appointments IS 'Stores all appointment details.';


-- FUNCTION to create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'Midgard');
  RETURN new;
END;
$$;
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile for a new user.';


-- TRIGGER to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR 'profiles' TABLE
CREATE POLICY "Allow public read access to profiles"
ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Allow user to update their own profile"
ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- POLICIES FOR 'clients', 'services', 'appointments'
-- For development, allow broad access. We'll tighten this later.
CREATE POLICY "Allow public read access on clients"
ON public.clients
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage clients"
ON public.clients
FOR ALL USING (auth.role() = 'authenticated');


CREATE POLICY "Allow public read access on services"
ON public.services
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage services"
ON public_sso.services
FOR ALL USING (auth.role() = 'authenticated');


CREATE POLICY "Allow public read access on appointments"
ON public.appointments
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage appointments"
ON public.appointments
FOR ALL USING (auth.role() = 'authenticated');
