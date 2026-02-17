-- Esquema Purificado Sanca Saúde

CREATE TABLE public.specialties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.doctors (
  id UUID PRIMARY KEY,
  clinic_id UUID,
  specialty_id UUID REFERENCES public.specialties(id),
  crm TEXT,
  bio TEXT,
  google_calendar_id TEXT,
  google_refresh_token TEXT,
  is_calendar_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID,
  specialty_id UUID REFERENCES public.specialties(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  cpf TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID,
  client_id UUID REFERENCES public.clients(id),
  doctor_id UUID REFERENCES public.doctors(id),
  service_id UUID REFERENCES public.services(id),
  service TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);