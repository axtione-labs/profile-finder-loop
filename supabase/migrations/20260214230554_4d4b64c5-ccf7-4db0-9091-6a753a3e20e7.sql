-- Allow commissions to exist without a mission (for preserved paid commissions after lead deletion)
ALTER TABLE public.commissions ALTER COLUMN mission_id DROP NOT NULL;