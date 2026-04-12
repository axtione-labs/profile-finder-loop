
CREATE POLICY "Apporteurs can update invoice on their own commissions"
ON public.commissions
FOR UPDATE
TO authenticated
USING (auth.uid() = apporteur_id)
WITH CHECK (auth.uid() = apporteur_id);
