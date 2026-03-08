
-- Restaurants table
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  cuisine text NOT NULL,
  rating numeric NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  delivery_time text,
  distance text,
  distance_km numeric NOT NULL DEFAULT 0,
  price_range text,
  description text,
  address text,
  tags text[] DEFAULT '{}',
  has_table_reservation boolean NOT NULL DEFAULT false,
  has_delivery boolean NOT NULL DEFAULT true,
  latitude numeric,
  longitude numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Public read access for restaurants
CREATE POLICY "Anyone can view restaurants"
  ON public.restaurants FOR SELECT
  USING (true);

-- Menu items table
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text NOT NULL,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu items"
  ON public.menu_items FOR SELECT
  USING (true);

-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  review_text text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  reward_points integer NOT NULL DEFAULT 0,
  helpful integer NOT NULL DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update trigger for restaurants
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime on orders for live tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
