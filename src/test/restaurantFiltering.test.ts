import { describe, it, expect } from "vitest";

/**
 * Tests for restaurant discovery filtering and sorting logic.
 * Extracted from Index.tsx filtering patterns.
 */

interface RestaurantStub {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distanceKm: number;
  tags: string[];
}

const RESTAURANTS: RestaurantStub[] = [
  { id: "1", name: "Sakura Sushi", cuisine: "Japanese", rating: 4.8, distanceKm: 1.2, tags: ["sushi", "fine dining"] },
  { id: "2", name: "El Fuego Taqueria", cuisine: "Mexican", rating: 4.5, distanceKm: 0.8, tags: ["tacos", "casual"] },
  { id: "3", name: "Pasta Roma", cuisine: "Italian", rating: 4.2, distanceKm: 3.5, tags: ["pasta", "romantic"] },
  { id: "4", name: "Dragon Palace", cuisine: "Chinese", rating: 4.6, distanceKm: 2.1, tags: ["dim sum", "family"] },
  { id: "5", name: "The Curry House", cuisine: "Indian", rating: 4.3, distanceKm: 5.0, tags: ["curry", "spicy"] },
];

function filterByCuisine(restaurants: RestaurantStub[], cuisine: string): RestaurantStub[] {
  if (cuisine === "All") return restaurants;
  return restaurants.filter((r) => r.cuisine === cuisine);
}

function filterBySearch(restaurants: RestaurantStub[], query: string): RestaurantStub[] {
  const q = query.toLowerCase();
  return restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
  );
}

function sortRestaurants(restaurants: RestaurantStub[], sortBy: string): RestaurantStub[] {
  const copy = [...restaurants];
  switch (sortBy) {
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "distance":
      return copy.sort((a, b) => a.distanceKm - b.distanceKm);
    default:
      return copy;
  }
}

describe("Restaurant Discovery", () => {
  describe("Cuisine Filtering", () => {
    it("returns all restaurants for 'All' filter", () => {
      expect(filterByCuisine(RESTAURANTS, "All")).toHaveLength(5);
    });

    it("filters by specific cuisine", () => {
      const result = filterByCuisine(RESTAURANTS, "Japanese");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Sakura Sushi");
    });

    it("returns empty for non-existent cuisine", () => {
      expect(filterByCuisine(RESTAURANTS, "French")).toHaveLength(0);
    });
  });

  describe("Search Filtering", () => {
    it("finds by restaurant name", () => {
      const result = filterBySearch(RESTAURANTS, "dragon");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("4");
    });

    it("finds by cuisine type", () => {
      const result = filterBySearch(RESTAURANTS, "italian");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("3");
    });

    it("finds by tag", () => {
      const result = filterBySearch(RESTAURANTS, "sushi");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("returns all for empty query", () => {
      expect(filterBySearch(RESTAURANTS, "")).toHaveLength(5);
    });

    it("is case-insensitive", () => {
      expect(filterBySearch(RESTAURANTS, "CURRY")).toHaveLength(1);
    });
  });

  describe("Sorting", () => {
    it("sorts by rating descending", () => {
      const sorted = sortRestaurants(RESTAURANTS, "rating");
      expect(sorted[0].rating).toBe(4.8);
      expect(sorted[sorted.length - 1].rating).toBe(4.2);
    });

    it("sorts by distance ascending", () => {
      const sorted = sortRestaurants(RESTAURANTS, "distance");
      expect(sorted[0].distanceKm).toBe(0.8);
      expect(sorted[sorted.length - 1].distanceKm).toBe(5.0);
    });

    it("preserves order for unknown sort key", () => {
      const sorted = sortRestaurants(RESTAURANTS, "unknown");
      expect(sorted.map((r) => r.id)).toEqual(["1", "2", "3", "4", "5"]);
    });
  });

  describe("Combined Filters", () => {
    it("applies cuisine + search together", () => {
      const bySearch = filterBySearch(RESTAURANTS, "spicy");
      const byCuisine = filterByCuisine(bySearch, "Indian");
      expect(byCuisine).toHaveLength(1);
      expect(byCuisine[0].name).toBe("The Curry House");
    });

    it("applies cuisine + sort together", () => {
      const all = filterByCuisine(RESTAURANTS, "All");
      const sorted = sortRestaurants(all, "distance");
      expect(sorted[0].name).toBe("El Fuego Taqueria");
    });
  });
});
