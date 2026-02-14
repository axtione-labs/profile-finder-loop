
-- Allow admins to delete missions
CREATE POLICY "Admins can delete missions"
ON public.missions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete commissions
CREATE POLICY "Admins can delete commissions"
ON public.commissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
