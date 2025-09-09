-- Tabela de Perfis de Usuários (profiles)
-- Armazena informações dos usuários do sistema.
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    role text NOT NULL CHECK (role IN ('Bifrost', 'Heimdall', 'Asgard', 'Midgard')),
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user to update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- Tabela de Clientes (clients)
-- Armazena os dados dos clientes do estúdio.
CREATE TABLE public.clients (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    whatsapp text NOT NULL,
    telegram text,
    email text UNIQUE,
    assigned_to_id uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage clients" ON public.clients FOR ALL TO authenticated USING (true);


-- Tabela de Serviços (services)
-- Armazena os serviços oferecidos pelo estúdio.
CREATE TABLE public.services (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    duration text NOT NULL,
    price numeric(10, 2) NOT NULL,
    icon text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage services" ON public.services FOR ALL TO authenticated USING (true);


-- Tabela de Agendamentos (appointments)
-- Armazena todos os agendamentos.
CREATE TABLE public.appointments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    date_time timestamp with time zone NOT NULL,
    status text NOT NULL CHECK (status IN ('Agendado', 'Realizado', 'Cancelado', 'Bloqueado')),
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage appointments" ON public.appointments FOR ALL TO authenticated USING (true);

-- Adicionando dados iniciais para o usuário admin, se não existir
-- Esta função será acionada sempre que um novo usuário se registrar.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    'Heimdall', -- Por padrão, novos usuários podem ser Heimdall, ou ajuste conforme necessário.
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um novo usuário for criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

