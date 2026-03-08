import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { restaurants, sampleReviews } from "@/data/mockData";
import { useCart } from "@/context/CartContext";
import { Star, Clock, MapPin, ArrowLeft, Plus, Minus, CalendarDays, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const RestaurantDetail = () => {
  const { id } = useParams();
  const restaurant = restaurants.find(r => r.id === id);
  const { addItem, items } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">Restaurant not found.</p>
        <Link to="/" className="text-primary mt-4 inline-block hover:underline">Go back</Link>
      </div>
    );
  }

  const categories = ["All", ...Array.from(new Set(restaurant.menuItems.map(m => m.category)))];
  const filteredMenu = selectedCategory === "All"
    ? restaurant.menuItems
    : restaurant.menuItems.filter(m => m.category === selectedCategory);

  const getItemQuantity = (itemId: string) => {
    const cartItem = items.find(i => i.menuItem.id === itemId);
    return cartItem?.quantity || 0;
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground">{restaurant.name}</h1>
            <p className="text-primary-foreground/80 mt-1">{restaurant.cuisine} · {restaurant.priceRange}</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Info bar */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold text-accent-foreground">{restaurant.rating}</span>
                <span className="text-sm text-muted-foreground">({restaurant.reviewCount})</span>
              </div>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> {restaurant.deliveryTime}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {restaurant.address}
              </span>
            </div>

            <p className="text-muted-foreground mb-8">{restaurant.description}</p>

            {/* Action buttons */}
            <div className="flex gap-3 mb-8">
              {restaurant.hasDelivery && (
                <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                  <ShoppingBag className="h-4 w-4" /> Order Delivery
                </button>
              )}
              {restaurant.hasTableReservation && (
                <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                  <CalendarDays className="h-4 w-4" /> Reserve Table
                </button>
              )}
            </div>

            {/* Menu */}
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Menu</h2>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredMenu.map((item) => {
                  const qty = getItemQuantity(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                        <p className="text-sm font-semibold text-primary mt-1">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {qty > 0 ? (
                          <div className="flex items-center gap-2 rounded-full bg-accent px-2 py-1">
                            <button
                              onClick={() => {
                                const cartItem = items.find(i => i.menuItem.id === item.id);
                                if (cartItem && cartItem.quantity > 1) {
                                  // Would need updateQuantity from cart
                                }
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-muted hover:bg-border transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5 text-foreground" />
                            </button>
                            <span className="text-sm font-semibold text-foreground w-5 text-center">{qty}</span>
                            <button
                              onClick={() => {
                                addItem(item, restaurant.id, restaurant.name);
                                toast.success(`Added ${item.name}`);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary hover:opacity-90 transition-opacity"
                            >
                              <Plus className="h-3.5 w-3.5 text-primary-foreground" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              addItem(item, restaurant.id, restaurant.name);
                              toast.success(`Added ${item.name}`);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary hover:opacity-90 transition-opacity"
                          >
                            <Plus className="h-4 w-4 text-primary-foreground" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Reviews */}
            <h2 className="font-heading text-2xl font-bold text-foreground mt-12 mb-4">Reviews</h2>
            <div className="space-y-4">
              {sampleReviews.map(review => (
                <div key={review.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                        <span className="text-sm font-semibold text-accent-foreground">{review.userName[0]}</span>
                      </div>
                      <span className="font-semibold text-foreground text-sm">{review.userName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.text}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{review.date}</span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      +{review.rewardPoints} pts earned
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Cart preview */}
          <div className="hidden lg:block">
            <div className="sticky top-20 rounded-2xl border border-border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Your Order</h3>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Your cart is empty. Add items from the menu.</p>
              ) : (
                <div>
                  {items.map(item => (
                    <div key={item.menuItem.id} className="flex justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.menuItem.name}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-border flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-semibold text-foreground">
                      ${items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                  <Link
                    to="/cart"
                    className="mt-4 block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    View Cart
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
