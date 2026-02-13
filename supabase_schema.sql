-- Criar tabela de clientes
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de agendamentos
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para ambas as tabelas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes
CREATE POLICY "Usuários podem ver seus próprios clientes" 
ON public.clients FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários podem inserir clientes" 
ON public.clients FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar clientes" 
ON public.clients FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Usuários podem deletar clientes" 
ON public.clients FOR DELETE 
TO authenticated 
USING (true);

-- Políticas para agendamentos
CREATE POLICY "Usuários podem ver seus próprios agendamentos" 
ON public.appointments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários podem inserir agendamentos" 
ON public.appointments FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar agendamentos" 
ON public.appointments FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Usuários podem deletar agendamentos" 
ON public.appointments FOR DELETE 
TO authenticated 
USING (true);