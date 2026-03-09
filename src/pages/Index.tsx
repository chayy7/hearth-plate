import { useState, useMemo } from "react";
import HeroSection from "@/components/HeroSection";
import CuisineFilter from "@/components/CuisineFilter";
import RestaurantCard from "@/components/RestaurantCard";
import EventsSection from "@/components/EventsSection";
import { distanceFilters, ratingFilters, sortOptions } from "@/data/mockData";
import { useRestaurants } from "@/hooks/useRestaurants";
import { motion } from "framer-motion";
import { SlidersHorizontal, MapPin, Star, ArrowUpDown, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";

const Index = () => {
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [maxDistance, setMaxDistance] = useState(999);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);

  const { data: restaurants = [], isLoading } = useRestaurants();

  const filtered = useMemo(() => {
    let result = restaurants;

    if (selectedCuisine !== "All") {
      result = result.filter(r => r.cuisine === selectedCuisine);
    }
    if (maxDistance < 999) {
      result = result.filter(r => r.distanceKm <= maxDistance);
    }
    if (minRating > 0) {
      result = result.filter(r => r.rating >= minRating);
    }

    // Sort
    switch (sortBy) {
      case "distance":
        result = [...result].sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "delivery":
        result = [...result].sort((a, b) => {
          const getMin = (t: string) => parseInt(t.split("-")[0]);
          return getMin(a.deliveryTime) - getMin(b.deliveryTime);
        });
        break;
    }

    return result;
  }, [restaurants, selectedCuisine, maxDistance, minRating, sortBy]);

  const activeFilterCount = (maxDistance < 999 ? 1 : 0) + (minRating > 0 ? 1 : 0) + (sortBy !== "recommended" ? 1 : 0);

  return (
    <div className="min-h-screen">
      <HeroSection />

      <section className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Restaurants Near You
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-primary text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Expandable filters */}
          <motion.div
            initial={false}
            animate={{ height: showFilters ? "auto" : 0, opacity: showFilters ? 1 : 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 rounded-2xl border border-border bg-card p-5">
              {/* Distance */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                  <MapPin className="h-3.5 w-3.5" /> Distance
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {distanceFilters.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setMaxDistance(f.value)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        maxDistance === f.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                  <Star className="h-3.5 w-3.5" /> Min Rating
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ratingFilters.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setMinRating(f.value)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        minRating === f.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                  <ArrowUpDown className="h-3.5 w-3.5" /> Sort By
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {sortOptions.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setSortBy(s.value)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        sortBy === s.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <CuisineFilter selected={selectedCuisine} onSelect={setSelectedCuisine} />
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((restaurant, i) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} index={i} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground text-lg">No restaurants match your filters.</p>
            <button
              onClick={() => { setMaxDistance(999); setMinRating(0); setSelectedCuisine("All"); setSortBy("recommended"); }}
              className="mt-3 text-primary text-sm font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      <EventsSection />
      <Footer />
    </div>
  );
};

export default Index;
