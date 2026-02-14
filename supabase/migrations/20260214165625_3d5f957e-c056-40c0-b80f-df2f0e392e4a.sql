
-- 1. Add contact fields to leads
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS contact_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email text DEFAULT '';

-- 2. Make candidates.lead_id nullable and add new fields
ALTER TABLE public.candidates
  ALTER COLUMN lead_id DROP NOT NULL;

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS position text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT '';

-- Migrate existing name data to first_name
UPDATE public.candidates SET first_name = name WHERE name != '';

-- 3. Add tjm_client to missions
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS tjm_client numeric NOT NULL DEFAULT 0;

-- 4. Add admin_amount to commissions  
ALTER TABLE public.commissions
  ADD COLUMN IF NOT EXISTS admin_amount numeric NOT NULL DEFAULT 0;

-- 5. Create storage bucket for CVs
INSERT INTO storage.buckets (id, name, public) VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for CVs
CREATE POLICY "Authenticated can upload CVs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'cvs');

CREATE POLICY "Public can view CVs"
ON storage.objects FOR SELECT
USING (bucket_id = 'cvs');

CREATE POLICY "Admins can delete CVs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'cvs' AND public.has_role(auth.uid(), 'admin'));

-- Update candidates SELECT policy for nullable lead_id
DROP POLICY IF EXISTS "View candidates" ON public.candidates;
CREATE POLICY "View candidates" ON public.candidates
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR (lead_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM leads WHERE leads.id = candidates.lead_id AND leads.user_id = auth.uid()
  ))
);

-- Allow apporteurs to also delete their own leads
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
CREATE POLICY "Users can delete leads" ON public.leads
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);
