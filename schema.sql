
-- ### TABELAS ###

-- Tabela de Perfis de Usuários
-- Armazena dados públicos dos usuários, complementando a tabela 'auth.users'.
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
      email TEXT,
        role TEXT NOT NULL DEFAULT 'Midgard',
          permissions JSONB NOT NULL DEFAULT '{}'::jsonb
          );
          COMMENT ON TABLE public.profiles IS 'Tabela de perfis públicos para cada usuário.';

          -- Tabela de Clientes
          -- Armazena informações dos clientes do estúdio.
          CREATE TABLE public.clients (
            id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL,
                whatsapp TEXT NOT NULL,
                  telegram TEXT,
                    email TEXT,
                      avatarUrl TEXT,
                        admin TEXT -- Nome do usuário que gerencia este cliente
                        );
                        COMMENT ON TABLE public.clients IS 'Armazena os clientes do estúdio.';

                        -- Tabela de Serviços
                        -- Armazena os serviços oferecidos pelo estúdio.
                        CREATE TABLE public.services (
                          id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
                            name TEXT NOT NULL,
                              duration TEXT,
                                price NUMERIC,
                                  icon TEXT
                                  );
                                  COMMENT ON TABLE public.services IS 'Serviços oferecidos pelo estúdio.';

                                  -- Tabela de Agendamentos
                                  -- Armazena os agendamentos dos clientes.
                                  CREATE TABLE public.appointments (
                                    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
                                      client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
                                        service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
                                          admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
                                            date_time TIMESTAMPTZ NOT NULL,
                                              notes TEXT,
                                                status TEXT NOT NULL DEFAULT 'Agendado' -- Ex: Agendado, Realizado, Cancelado
                                                );
                                                COMMENT ON TABLE public.appointments IS 'Agendamentos dos clientes.';


                                                -- ### FUNÇÃO E GATILHO PARA CRIAÇÃO AUTOMÁTICA DE PERFIL ###

                                                -- Esta função é acionada sempre que um novo usuário é criado na tabela auth.users.
                                                -- Ela insere uma nova linha na tabela public.profiles, populando-a com os dados do novo usuário.
                                                CREATE OR REPLACE FUNCTION public.handle_new_user()
                                                RETURNS TRIGGER AS $$
                                                BEGIN
                                                  INSERT INTO public.profiles (id, name, email, role)
                                                    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, 'Midgard');
                                                      RETURN NEW;
                                                      END;
                                                      $$ LANGUAGE plpgsql SECURITY DEFINER;

                                                      -- Este gatilho (trigger) chama a função handle_new_user() após cada inserção na tabela auth.users.
                                                      CREATE TRIGGER on_auth_user_created
                                                        AFTER INSERT ON auth.users
                                                          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


                                                          -- ### POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY) ###

                                                          -- Ativar RLS para todas as tabelas
                                                          ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
                                                          ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
                                                          ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
                                                          ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

                                                          -- Políticas para a tabela 'profiles'
                                                          CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
                                                          CREATE POLICY "Allow users to insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
                                                          CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

                                                          -- Políticas para a tabela 'clients'
                                                          CREATE POLICY "Allow public read access to clients" ON public.clients FOR SELECT USING (true);
                                                          CREATE POLICY "Allow authenticated users to manage clients" ON public.clients FOR ALL USING (auth.role() = 'authenticated');

                                                          -- Políticas para a tabela 'services'
                                                          CREATE POLICY "Allow public read access to services" ON public.services FOR SELECT USING (true);
                                                          CREATE POLICY "Allow authenticated users to manage services" ON public.services FOR ALL USING (auth.role() = 'authenticated');

                                                          -- Políticas para a tabela 'appointments'
                                                          CREATE POLICY "Allow public read access to appointments" ON public.appointments FOR SELECT USING (true);
                                                          CREATE POLICY "Allow authenticated users to manage appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');
                                                          