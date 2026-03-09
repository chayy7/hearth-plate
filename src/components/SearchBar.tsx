import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, UtensilsCrossed } from "lucide-react";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onSearchChange?: (query: string) => void;
  variant?: "default" | "hero";
  searchMode?: "restaurant" | "food";
}

interface FoodResult {
  menuItemName: string;
  menuItemPrice: number;
  menuItemCategory: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  restaurantCuisine: string;
}

const SearchBar = ({
  placeholder = "Search restaurants, cuisines...",
  className = "",
  inputClassName = "",
  onSearchChange,
  variant = "default",
  searchMode = "restaurant",
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const { data: restaurants = [] } = useRestaurants();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Restaurant suggestions
  const restaurantSuggestions = useMemo(() => {
    if (searchMode !== "restaurant" || !query.trim()) return [];
    const q = query.toLowerCase();
    return restaurants
      .filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [query, restaurants, searchMode]);

  // Food/menu item suggestions
  const foodSuggestions = useMemo(() => {
    if (searchMode !== "food" || !query.trim()) return [];
    const q = query.toLowerCase();
    const results: FoodResult[] = [];
    for (const r of restaurants) {
      for (const item of r.menuItems) {
        if (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        ) {
          results.push({
            menuItemName: item.name,
            menuItemPrice: item.price,
            menuItemCategory: item.category,
            restaurantId: r.id,
            restaurantName: r.name,
            restaurantImage: r.image,
            restaurantCuisine: r.cuisine,
          });
        }
      }
      if (results.length >= 8) break;
    }
    return results.slice(0, 8);
  }, [query, restaurants, searchMode]);

  const handleChange = (value: string) => {
    setQuery(value);
    onSearchChange?.(value);
  };

  const handleSelectRestaurant = (id: string) => {
    setQuery("");
    setFocused(false);
    onSearchChange?.("");
    navigate(`/restaurant/${id}`);
  };

  const handleSelectFood = (restaurantId: string) => {
    setQuery("");
    setFocused(false);
    onSearchChange?.("");
    navigate(`/restaurant/${restaurantId}`);
  };

  const handleClear = () => {
    setQuery("");
    onSearchChange?.("");
  };

  const showDropdown = focused && query.trim().length > 0;
  const hasSuggestions =
    searchMode === "restaurant" ? restaurantSuggestions.length > 0 : foodSuggestions.length > 0;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 ${
          variant === "hero"
            ? "rounded-xl bg-card border border-border px-4 py-3 card-elevated"
            : "rounded-full bg-muted px-4 py-2"
        } ${inputClassName}`}
      >
        {searchMode === "food" ? (
          <UtensilsCrossed className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={handleClear} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden max-h-80 overflow-y-auto"
          >
            {hasSuggestions ? (
              searchMode === "restaurant" ? (
                restaurantSuggestions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRestaurant(r.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
                  >
                    <img src={r.image} alt={r.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.cuisine} · {r.rating}★ · {r.deliveryTime}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                foodSuggestions.map((f, i) => (
                  <button
                    key={`${f.restaurantId}-${f.menuItemName}-${i}`}
                    onClick={() => handleSelectFood(f.restaurantId)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
                  >
                    <img src={f.restaurantImage} alt={f.restaurantName} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{f.menuItemName}</p>
                      <p className="text-xs text-muted-foreground">
                        ${f.menuItemPrice.toFixed(2)} · {f.menuItemCategory}
                      </p>
                      <p className="text-xs text-muted-foreground/70">at {f.restaurantName}</p>
                    </div>
                  </button>
                ))
              )
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No {searchMode === "food" ? "dishes" : "restaurants"} found for "{query}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
