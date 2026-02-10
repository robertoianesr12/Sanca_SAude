-- Substitua 'SEU_ID_AQUI' pelo UUID que você copiou do Authentication
INSERT INTO public.profiles (id, company_id, full_name)
VALUES ('SEU_ID_AQUI', 'trembao', 'Administrador TremBão')
ON CONFLICT (id) DO UPDATE SET company_id = 'trembao';

-- Garante que as políticas de segurança estão ativas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para o usuário ver o próprio perfil (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_select_policy') THEN
        CREATE POLICY "profiles_select_policy" ON public.profiles
        FOR SELECT TO authenticated USING (auth.uid() = id);
    END IF;
END $$;