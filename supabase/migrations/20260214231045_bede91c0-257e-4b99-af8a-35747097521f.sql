-- Create a secure view that hides phone for non-admins
CREATE OR REPLACE VIEW public.candidates_safe
WITH (security_invoker = on) AS
SELECT
  id, lead_id, name, first_name, last_name,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN phone ELSE NULL END AS phone,
  position, availability, experience, stack, tjm, status, cv_url, created_at, updated_at
FROM public.candidates;