-- Create profiles table (user profiles extending auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('lawyer', 'staff', 'client')),
  phone_number TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'closed', 'on-hold')),
  case_type TEXT,
  filing_date DATE,
  next_hearing_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments/consultations table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  document_type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case updates/timeline table
CREATE TABLE IF NOT EXISTS public.case_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  update_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_updates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Cases policies
CREATE POLICY "cases_select_own_or_assigned" ON public.cases FOR SELECT 
  USING (auth.uid() = client_id OR auth.uid() = lawyer_id);
CREATE POLICY "cases_insert_by_lawyer" ON public.cases FOR INSERT 
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('lawyer', 'staff'));
CREATE POLICY "cases_update_by_lawyer" ON public.cases FOR UPDATE 
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('lawyer', 'staff'));
CREATE POLICY "cases_delete_by_lawyer" ON public.cases FOR DELETE 
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('lawyer', 'staff'));

-- Appointments policies
CREATE POLICY "appointments_select_own_or_related" ON public.appointments FOR SELECT 
  USING (auth.uid() = client_id OR auth.uid() = lawyer_id);
CREATE POLICY "appointments_insert_by_lawyer" ON public.appointments FOR INSERT 
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('lawyer', 'staff'));
CREATE POLICY "appointments_update_by_lawyer" ON public.appointments FOR UPDATE 
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('lawyer', 'staff'));

-- Documents policies
CREATE POLICY "documents_select_case_participants" ON public.documents FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE id = case_id 
      AND (client_id = auth.uid() OR lawyer_id = auth.uid())
    )
  );
CREATE POLICY "documents_insert_by_case_participant" ON public.documents FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE id = case_id 
      AND (client_id = auth.uid() OR lawyer_id = auth.uid())
    )
  );

-- Case updates policies
CREATE POLICY "case_updates_select_case_participants" ON public.case_updates FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE id = case_id 
      AND (client_id = auth.uid() OR lawyer_id = auth.uid())
    )
  );
CREATE POLICY "case_updates_insert_by_lawyer" ON public.case_updates FOR INSERT 
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('lawyer', 'staff'));
