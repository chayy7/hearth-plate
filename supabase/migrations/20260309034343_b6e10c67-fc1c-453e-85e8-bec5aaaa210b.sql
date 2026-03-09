
-- Fix permissive INSERT policy on delivery_assignments
DROP POLICY "System can insert assignments" ON public.delivery_assignments;

CREATE POLICY "Authenticated users can insert assignments for courier_assigned orders"
  ON public.delivery_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    courier_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.status = 'courier_assigned'
    )
  );
