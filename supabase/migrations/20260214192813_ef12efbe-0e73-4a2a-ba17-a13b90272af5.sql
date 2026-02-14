
-- Add soft-delete column to profiles
ALTER TABLE public.profiles ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Update RLS: admins should still see soft-deleted profiles (for trash management)
-- No RLS change needed since admins already see all profiles

-- Apporteurs should NOT see their own profile if soft-deleted (handled in app logic)
