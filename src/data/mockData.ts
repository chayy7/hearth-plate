import restaurant1 from "@/assets/restaurant-1.jpg";
import restaurant2 from "@/assets/restaurant-2.jpg";
import restaurant3 from "@/assets/restaurant-3.jpg";
import restaurant4 from "@/assets/restaurant-4.jpg";
import restaurant5 from "@/assets/restaurant-5.jpg";
import restaurant6 from "@/assets/restaurant-6.jpg";
import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";

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
  priceRange: string;
  description: string;
  address: string;
  tags: string[];
  menuItems: MenuItem[];
  hasTableReservation: boolean;
  hasDelivery: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  restaurantId: string;
  restaurantName: string;
  quantity: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
  rewardPoints: number;
  helpful: number;
}

export const cuisineFilters = [
  "All", "Italian", "Japanese", "Mexican", "French", "Indian", "Thai", "American", "Mediterranean"
];

export const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Trattoria Bella",
    image: restaurant1,
    cuisine: "Italian",
    rating: 4.7,
    reviewCount: 324,
    deliveryTime: "25-35 min",
    distance: "1.2 km",
    priceRange: "$$",
    description: "Authentic Italian cuisine with handmade pasta and wood-fired pizzas in a cozy brick-walled setting.",
    address: "42 Via Roma Street",
    tags: ["Pasta", "Pizza", "Wine"],
    hasTableReservation: true,
    hasDelivery: true,
    menuItems: [
      { id: "m1", name: "Margherita Pizza", description: "San Marzano tomatoes, fresh mozzarella, basil", price: 14.99, category: "Pizza", available: true },
      { id: "m2", name: "Carbonara", description: "Guanciale, pecorino romano, black pepper, egg yolk", price: 16.99, category: "Pasta", available: true },
      { id: "m3", name: "Bruschetta", description: "Grilled bread with tomatoes, garlic, olive oil", price: 8.99, category: "Starters", available: true },
      { id: "m4", name: "Tiramisu", description: "Classic Italian dessert with mascarpone and espresso", price: 9.99, category: "Desserts", available: true },
      { id: "m5", name: "Osso Buco", description: "Braised veal shanks with gremolata", price: 24.99, category: "Mains", available: true },
      { id: "m6", name: "Caprese Salad", description: "Fresh mozzarella, tomatoes, basil, balsamic", price: 11.99, category: "Starters", available: true },
    ],
  },
  {
    id: "2",
    name: "Sakura Sushi House",
    image: restaurant2,
    cuisine: "Japanese",
    rating: 4.8,
    reviewCount: 512,
    deliveryTime: "30-40 min",
    distance: "2.1 km",
    priceRange: "$$$",
    description: "Premium sushi and sashimi prepared by master chefs using the freshest fish flown in daily.",
    address: "88 Zen Garden Lane",
    tags: ["Sushi", "Sashimi", "Ramen"],
    hasTableReservation: true,
    hasDelivery: true,
    menuItems: [
      { id: "m7", name: "Omakase Set", description: "Chef's selection of 12 premium nigiri pieces", price: 45.99, category: "Sushi", available: true },
      { id: "m8", name: "Tonkotsu Ramen", description: "Rich pork bone broth with chashu and soft egg", price: 15.99, category: "Ramen", available: true },
      { id: "m9", name: "Dragon Roll", description: "Tempura shrimp, avocado, eel sauce", price: 18.99, category: "Rolls", available: true },
      { id: "m10", name: "Edamame", description: "Steamed soybeans with sea salt", price: 5.99, category: "Starters", available: true },
      { id: "m11", name: "Mochi Ice Cream", description: "Assorted flavors, 3 pieces", price: 7.99, category: "Desserts", available: true },
    ],
  },
  {
    id: "3",
    name: "El Fuego Taqueria",
    image: restaurant3,
    cuisine: "Mexican",
    rating: 4.5,
    reviewCount: 287,
    deliveryTime: "20-30 min",
    distance: "0.8 km",
    priceRange: "$",
    description: "Vibrant street-style Mexican tacos and burritos with house-made salsas.",
    address: "15 Fiesta Avenue",
    tags: ["Tacos", "Burritos", "Margaritas"],
    hasTableReservation: false,
    hasDelivery: true,
    menuItems: [
      { id: "m12", name: "Street Tacos (3)", description: "Choice of carnitas, chicken, or al pastor", price: 10.99, category: "Tacos", available: true },
      { id: "m13", name: "Burrito Supreme", description: "Loaded burrito with rice, beans, guac, and meat", price: 12.99, category: "Burritos", available: true },
      { id: "m14", name: "Guacamole & Chips", description: "Fresh tableside guacamole", price: 8.99, category: "Starters", available: true },
      { id: "m15", name: "Churros", description: "Cinnamon sugar churros with chocolate sauce", price: 6.99, category: "Desserts", available: true },
    ],
  },
  {
    id: "4",
    name: "Le Petit Bistro",
    image: restaurant4,
    cuisine: "French",
    rating: 4.9,
    reviewCount: 198,
    deliveryTime: "35-45 min",
    distance: "3.0 km",
    priceRange: "$$$",
    description: "Charming French bistro with classic dishes, fine wines, and an intimate atmosphere.",
    address: "7 Rue de Lumière",
    tags: ["Wine", "Steak", "Fine Dining"],
    hasTableReservation: true,
    hasDelivery: false,
    menuItems: [
      { id: "m16", name: "Steak Frites", description: "Dry-aged ribeye with truffle fries", price: 32.99, category: "Mains", available: true },
      { id: "m17", name: "French Onion Soup", description: "Caramelized onions, gruyère crouton", price: 12.99, category: "Starters", available: true },
      { id: "m18", name: "Crème Brûlée", description: "Vanilla bean custard with caramelized sugar", price: 10.99, category: "Desserts", available: true },
      { id: "m19", name: "Duck Confit", description: "Slow-cooked duck leg with lentils", price: 28.99, category: "Mains", available: true },
    ],
  },
  {
    id: "5",
    name: "Spice Route",
    image: restaurant5,
    cuisine: "Indian",
    rating: 4.6,
    reviewCount: 401,
    deliveryTime: "25-35 min",
    distance: "1.5 km",
    priceRange: "$$",
    description: "Aromatic Indian dishes with rich spice blends and traditional tandoor cooking.",
    address: "29 Saffron Road",
    tags: ["Curry", "Tandoor", "Biryani"],
    hasTableReservation: true,
    hasDelivery: true,
    menuItems: [
      { id: "m20", name: "Butter Chicken", description: "Creamy tomato-based curry with tender chicken", price: 16.99, category: "Curries", available: true },
      { id: "m21", name: "Lamb Biryani", description: "Fragrant basmati rice with spiced lamb", price: 18.99, category: "Rice", available: true },
      { id: "m22", name: "Garlic Naan", description: "Fresh tandoor-baked bread with garlic butter", price: 3.99, category: "Breads", available: true },
      { id: "m23", name: "Samosa (2)", description: "Crispy pastry with spiced potato filling", price: 6.99, category: "Starters", available: true },
      { id: "m24", name: "Gulab Jamun", description: "Sweet milk dumplings in rose syrup", price: 5.99, category: "Desserts", available: true },
    ],
  },
  {
    id: "6",
    name: "Bangkok Street Kitchen",
    image: restaurant6,
    cuisine: "Thai",
    rating: 4.4,
    reviewCount: 356,
    deliveryTime: "20-30 min",
    distance: "1.0 km",
    priceRange: "$$",
    description: "Bold Thai street food flavors with fiery curries and aromatic stir-fries.",
    address: "51 Soi Sukhumvit",
    tags: ["Pad Thai", "Curry", "Street Food"],
    hasTableReservation: false,
    hasDelivery: true,
    menuItems: [
      { id: "m25", name: "Pad Thai", description: "Stir-fried rice noodles with shrimp and peanuts", price: 13.99, category: "Noodles", available: true },
      { id: "m26", name: "Green Curry", description: "Thai green curry with chicken and bamboo shoots", price: 14.99, category: "Curries", available: true },
      { id: "m27", name: "Tom Yum Soup", description: "Hot and sour soup with prawns", price: 10.99, category: "Soups", available: true },
      { id: "m28", name: "Mango Sticky Rice", description: "Sweet coconut sticky rice with ripe mango", price: 8.99, category: "Desserts", available: true },
    ],
  },
];

export const sampleReviews: Review[] = [
  { id: "r1", userName: "Sarah M.", rating: 5, text: "The Carbonara was absolutely divine! Perfectly al dente pasta with the creamiest sauce. The ambiance was warm and inviting — felt like dining in Rome.", date: "2 days ago", rewardPoints: 45, helpful: 12 },
  { id: "r2", userName: "James K.", rating: 4, text: "Great sushi quality. The omakase was fresh and beautifully presented. Slightly long wait but worth it.", date: "1 week ago", rewardPoints: 30, helpful: 8 },
  { id: "r3", userName: "Priya R.", rating: 5, text: "Best butter chicken in the city! Rich, creamy, and perfectly spiced. The garlic naan was pillowy soft.", date: "3 days ago", rewardPoints: 35, helpful: 15 },
];
