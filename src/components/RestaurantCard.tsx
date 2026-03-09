import { memo } from "react";
import { Link } from "react-router-dom";
import { Star, Clock, MapPin, Utensils, CalendarDays } from "lucide-react";
import type { Restaurant } from "@/hooks/useRestaurants";
import { motion } from "framer-motion";

interface Props {
  restaurant: Restaurant;
  index: number;
}

const RestaurantCard = memo(({ restaurant, index }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/restaurant/${restaurant.id}`} className="block group">
        <div className="rounded-2xl bg-card border border-border overflow-hidden card-elevated">
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              {restaurant.hasDelivery && (
                <span className="rounded-full bg-card/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-foreground flex items-center gap-1">
                  <Utensils className="h-3 w-3" /> Delivery
                </span>
              )}
              {restaurant.hasTableReservation && (
                <span className="rounded-full bg-card/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-foreground flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Dine-in
                </span>
              )}
            </div>
            <div className="absolute top-3 right-3 rounded-full bg-card/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-foreground">
              {restaurant.priceRange}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {restaurant.name}
                </h3>
                <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-accent px-2 py-1">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-sm font-semibold text-accent-foreground">{restaurant.rating}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {restaurant.deliveryTime}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {restaurant.distance}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              {restaurant.tags.map(tag => (
                <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

RestaurantCard.displayName = "RestaurantCard";

export default RestaurantCard;
