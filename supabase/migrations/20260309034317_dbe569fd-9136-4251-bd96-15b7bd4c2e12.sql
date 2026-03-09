
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('consumer', 'merchant', 'courier');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Merchant-restaurant linking table
CREATE TABLE public.merchant_restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, restaurant_id)
);
ALTER TABLE public.merchant_restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their linked restaurants"
  ON public.merchant_restaurants FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Delivery assignments table
CREATE TABLE public.delivery_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  courier_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'assigned',
  pickup_at timestamptz,
  delivered_at timestamptz,
  payout numeric NOT NULL DEFAULT 0,
  simulated_progress integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id)
);
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couriers can view their assignments"
  ON public.delivery_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = courier_id);

CREATE POLICY "Couriers can update their assignments"
  ON public.delivery_assignments FOR UPDATE
  TO authenticated
  USING (auth.uid() = courier_id);

CREATE POLICY "System can insert assignments"
  ON public.delivery_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 7. Enable realtime for delivery_assignments
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_assignments;

-- 8. Add trigger for auto-assigning consumer role on signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'consumer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- 9. Function for merchant to get their restaurant ID
CREATE OR REPLACE FUNCTION public.get_merchant_restaurant(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT restaurant_id FROM public.merchant_restaurants
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- 10. Function for courier to get available deliveries (orders in courier_assigned status without assignment)
CREATE OR REPLACE FUNCTION public.get_available_deliveries()
RETURNS TABLE(
  order_id uuid,
  restaurant_name text,
  restaurant_id text,
  total numeric,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id as order_id, o.restaurant_name, o.restaurant_id, o.total, o.created_at
  FROM public.orders o
  WHERE o.status = 'courier_assigned'
    AND NOT EXISTS (SELECT 1 FROM public.delivery_assignments da WHERE da.order_id = o.id)
  ORDER BY o.created_at DESC;
$$;
