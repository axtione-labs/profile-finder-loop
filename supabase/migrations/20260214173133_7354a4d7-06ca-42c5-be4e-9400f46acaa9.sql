
-- 1. Soft-delete for apporteurs: hide leads without removing admin data
ALTER TABLE public.leads ADD COLUMN hidden_by_user boolean NOT NULL DEFAULT false;

-- 2. Add days_worked, month, year to commissions for monthly tracking
ALTER TABLE public.commissions ADD COLUMN days_worked numeric NOT NULL DEFAULT 0;
ALTER TABLE public.commissions ADD COLUMN commission_month integer NOT NULL DEFAULT EXTRACT(MONTH FROM now());
ALTER TABLE public.commissions ADD COLUMN commission_year integer NOT NULL DEFAULT EXTRACT(YEAR FROM now());
