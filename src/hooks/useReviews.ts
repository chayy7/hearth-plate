import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
  rewardPoints: number;
  helpful: number;
  tags: string[];
}

export function useReviews(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", restaurantId],
    queryFn: async (): Promise<Review[]> => {
      if (!restaurantId) return [];

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((r) => ({
        id: r.id,
        userName: r.user_id.slice(0, 8), // fallback display name
        rating: r.rating,
        text: r.review_text ?? "",
        date: new Date(r.created_at).toLocaleDateString(),
        rewardPoints: r.reward_points,
        helpful: r.helpful,
        tags: r.tags ?? [],
      }));
    },
    enabled: !!restaurantId,
  });
}
