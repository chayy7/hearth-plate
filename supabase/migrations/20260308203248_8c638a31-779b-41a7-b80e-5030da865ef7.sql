
-- Drop the overly permissive policy
DROP POLICY "Authenticated users can update restaurant stats" ON public.restaurants;

-- Create a security definer function to safely update restaurant stats
CREATE OR REPLACE FUNCTION public.update_restaurant_review_stats(
  _restaurant_id uuid,
  _new_rating integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count integer;
  _avg numeric;
BEGIN
  SELECT count(*), coalesce(avg(rating), 0)
  INTO _count, _avg
  FROM public.reviews
  WHERE restaurant_id = _restaurant_id;

  UPDATE public.restaurants
  SET review_count = _count,
      rating = round(_avg::numeric, 1)
  WHERE id = _restaurant_id;
END;
$$;
