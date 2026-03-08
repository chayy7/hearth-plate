import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Map DB image URLs to local assets
import restaurant1 from "@/assets/restaurant-1.jpg";
import restaurant2 from "@/assets/restaurant-2.jpg";
import restaurant3 from "@/assets/restaurant-3.jpg";
import restaurant4 from "@/assets/restaurant-4.jpg";
import restaurant5 from "@/assets/restaurant-5.jpg";
import restaurant6 from "@/assets/restaurant-6.jpg";

const imageMap: Record<string, string> = {
  "/restaurant-1.jpg": restaurant1,
  "/restaurant-2.jpg": restaurant2,
  "/restaurant-3.jpg": restaurant3,
  "/restaurant-4.jpg": restaurant4,
  "/restaurant-5.jpg": restaurant5,
  "/restaurant-6.jpg": restaurant6,
};

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  distance: string;
  distanceKm: number;
  priceRange: string;
  description: string;
  address: string;
  tags: string[];
  menuItems: MenuItem[];
  hasTableReservation: boolean;
  hasDelivery: boolean;
}

async function fetchRestaurants(): Promise<Restaurant[]> {
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("*");

  if (error) throw error;

  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select("*");

  if (menuError) throw menuError;

  return (restaurants ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    image: imageMap[r.image_url ?? ""] ?? r.image_url ?? "",
    cuisine: r.cuisine,
    rating: Number(r.rating),
    reviewCount: r.review_count,
    deliveryTime: r.delivery_time ?? "",
    distance: r.distance ?? "",
    distanceKm: Number(r.distance_km),
    priceRange: r.price_range ?? "",
    description: r.description ?? "",
    address: r.address ?? "",
    tags: r.tags ?? [],
    hasTableReservation: r.has_table_reservation,
    hasDelivery: r.has_delivery,
    menuItems: (menuItems ?? [])
      .filter((m) => m.restaurant_id === r.id)
      .map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description ?? "",
        price: Number(m.price),
        category: m.category,
        available: m.available,
      })),
  }));
}

export function useRestaurants() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: fetchRestaurants,
  });
}

export function useRestaurant(id: string | undefined) {
  const query = useRestaurants();
  const restaurant = query.data?.find((r) => r.id === id);
  return { ...query, restaurant };
}
