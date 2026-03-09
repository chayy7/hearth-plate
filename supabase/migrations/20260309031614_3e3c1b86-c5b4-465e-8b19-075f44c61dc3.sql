
CREATE OR REPLACE FUNCTION public.place_order(
  _user_id uuid,
  _restaurant_id text,
  _restaurant_name text,
  _subtotal numeric,
  _delivery_fee numeric,
  _service_fee numeric,
  _total numeric,
  _items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order_id uuid;
  _item jsonb;
BEGIN
  INSERT INTO public.orders (user_id, restaurant_id, restaurant_name, subtotal, delivery_fee, service_fee, total)
  VALUES (_user_id, _restaurant_id, _restaurant_name, _subtotal, _delivery_fee, _service_fee, _total)
  RETURNING id INTO _order_id;

  INSERT INTO public.order_items (order_id, item_name, item_price, quantity)
  SELECT _order_id, (item->>'item_name')::text, (item->>'item_price')::numeric, (item->>'quantity')::integer
  FROM jsonb_array_elements(_items) AS item;

  RETURN _order_id;
END;
$$;
