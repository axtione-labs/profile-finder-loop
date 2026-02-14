
-- Add admin_comment to profiles for admin notes on apporteurs
ALTER TABLE public.profiles ADD COLUMN admin_comment text DEFAULT '';
