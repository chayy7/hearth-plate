
-- Allow authenticated users to update restaurant review stats
CREATE POLICY "Authenticated users can update restaurant stats"
  ON public.restaurants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
