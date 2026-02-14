-- Tabela de Especialidades
CREATE TABLE public.specialties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Serviços/Consultas
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  specialty_id UUID REFERENCES public.specialties(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  duration INTEGER, -- em minutos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Clientes (Pacientes) - Unificada por Telefone
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Médicos (Profiles com role 'doctor')
-- Nota: A tabela profiles é gerenciada pelo trigger handle_new_user

-- Tabela de Agendamentos
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  doctor_id UUID REFERENCES auth.users(id), -- Referência ao médico
  patient_id UUID REFERENCES auth.users(id), -- Referência ao usuário se logado
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'requested', -- requested, scheduled, confirmed, completed, cancelled
  service TEXT, -- Nome da especialidade no momento do agendamento
  notes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas (Acesso Público para Leitura de Serviços)
CREATE POLICY "Acesso público para leitura de especialidades" ON public.specialties FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de serviços" ON public.services FOR SELECT USING (true);

-- Políticas para Clientes e Agendamentos (Acesso via Service Role ou Auth)
CREATE POLICY "Permitir inserção pública de clientes" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserção pública de agendamentos" ON public.appointments FOR INSERT WITH CHECK (true);