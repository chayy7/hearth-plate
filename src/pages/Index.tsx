import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import CuisineFilter from "@/components/CuisineFilter";
import RestaurantCard from "@/components/RestaurantCard";
import EventsSection from "@/components/EventsSection";
import { restaurants } from "@/data/mockData";
import { motion } from "framer-motion";

const Index = () => {
  const [selectedCuisine, setSelectedCuisine] = useState("All");

  const filtered = selectedCuisine === "All"
    ? restaurants
    : restaurants.filter(r => r.cuisine === selectedCuisine);

  return (
    <div className="min-h-screen">
      <HeroSection />

      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6">
            Restaurants Near You
          </h2>
          <CuisineFilter selected={selectedCuisine} onSelect={setSelectedCuisine} />
        </motion.div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((restaurant, i) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground text-lg">No restaurants found for this cuisine.</p>
          </div>
        )}
      </section>

      <EventsSection />
    </div>
  );
};

export default Index;
