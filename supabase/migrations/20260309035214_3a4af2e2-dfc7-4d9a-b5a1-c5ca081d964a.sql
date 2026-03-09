
-- Allow authenticated users to insert into merchant_restaurants (for self-registration)
CREATE POLICY "Users can register as merchant"
  ON public.merchant_restaurants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to assign themselves the merchant role
CREATE POLICY "Users can assign themselves roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
