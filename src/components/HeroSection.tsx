import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import heroImage from "@/assets/hero-food.jpg";
import SearchBar from "@/components/SearchBar";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight text-foreground">
              Discover, Order &{" "}
              <span className="text-gradient-warm">Dine Out</span>
              <br />All in One Place
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Food delivery, table reservations, and event discovery — unified in a single delightful experience.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-3 flex-1 card-elevated">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="What are you craving?"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-3 card-elevated">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-foreground">Downtown</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-6">
              <div className="text-center">
                <p className="font-heading text-2xl font-bold text-foreground">500+</p>
                <p className="text-xs text-muted-foreground">Restaurants</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="font-heading text-2xl font-bold text-foreground">50k+</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="font-heading text-2xl font-bold text-foreground">20 min</p>
                <p className="text-xs text-muted-foreground">Avg Delivery</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
              <img
                src={heroImage}
                alt="Delicious gourmet burger"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-4 -left-4 rounded-2xl bg-card border border-border p-4 card-elevated"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                  <span className="text-lg">🔥</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Trending Now</p>
                  <p className="text-xs text-muted-foreground">42 orders in the last hour</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
