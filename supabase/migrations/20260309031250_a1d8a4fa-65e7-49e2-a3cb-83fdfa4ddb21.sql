
CREATE OR REPLACE FUNCTION public.get_order_items_for_restaurant(_restaurant_id text)
RETURNS TABLE(
  id uuid,
  order_id uuid,
  item_name text,
  item_price numeric,
  quantity integer,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT oi.id, oi.order_id, oi.item_name, oi.item_price, oi.quantity, oi.created_at
  FROM public.order_items oi
  INNER JOIN public.orders o ON o.id = oi.order_id
  WHERE o.restaurant_id = _restaurant_id;
$$;
