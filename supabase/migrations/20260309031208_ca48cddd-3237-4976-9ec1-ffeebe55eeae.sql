
CREATE OR REPLACE FUNCTION public.get_restaurant_orders(_restaurant_id text)
RETURNS SETOF public.orders
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.orders
  WHERE restaurant_id = _restaurant_id
  ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.merchant_update_order_status(_order_id uuid, _new_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET status = _new_status, updated_at = now()
  WHERE id = _order_id;
END;
$$;
