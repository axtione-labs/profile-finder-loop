
-- Add margin management columns to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS margin_status TEXT NOT NULL DEFAULT 'pending' CHECK (margin_status IN ('pending', 'accepted', 'refused', 'adapted'));
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS admin_margin NUMERIC NOT NULL DEFAULT 0;
