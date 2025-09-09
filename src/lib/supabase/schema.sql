
-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP TABLE IF EXISTS public.appointments;
DROP TABLE IF EXISTS public.services;
DROP TABLE IF EXISTS public.clients;
DROP TABLE IF EXISTS public.profiles;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Midgard',
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb
);
COMMENT ON TABLE public.profiles IS 'Stores user profiles, extending auth.users.';

-- Create clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    whatsapp VARCHAR(50) NOT NULL,
    telegram VARCHAR(50),
    avatarUrl TEXT,
    admin VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.clients IS 'Stores client information for the studio.';

-- Create services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.services IS 'Stores the services offered by the studio.';

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    date_time TIMESTAMPTZ NOT NULL,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Agendado', -- e.g., Agendado, Realizado, Cancelado
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.appointments IS 'Stores appointment details.';


-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$;

-- Trigger to call the function when a new user is created in auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- RLS POLICIES --

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Clients Policies
CREATE POLICY "Allow public read access to clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage clients" ON public.clients FOR ALL USING (auth.role() = 'authenticated');

-- Services Policies
CREATE POLICY "Allow public read access to services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage services" ON public.services FOR ALL USING (auth.role() = 'authenticated');

-- Appointments Policies
CREATE POLICY "Allow public read access to appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');

-- Grant usage on schemas to all roles
GRANT USAGE ON SCHEMA public TO service_role, authenticated, anon;

-- Grant all privileges on tables to supabase_admin
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, supabase_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, supabase_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, supabase_admin;

-- Grant selective privileges to roles
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;

