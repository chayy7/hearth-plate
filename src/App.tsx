import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import RestaurantDetail from "./pages/RestaurantDetail";
import EventDetail from "./pages/EventDetail";
import Cart from "./pages/Cart";
import MerchantDashboard from "./pages/MerchantDashboard";
import WriteReview from "./pages/WriteReview";
import OrderTracking from "./pages/OrderTracking";
import CourierDashboard from "./pages/CourierDashboard";
import Rewards from "./pages/Rewards";
import Auth from "./pages/Auth";
import OrderHistory from "./pages/OrderHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/restaurant/:id" element={<RestaurantDetail />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/merchant" element={<MerchantDashboard />} />
              <Route path="/review/:restaurantId" element={<WriteReview />} />
              <Route path="/tracking/:orderId?" element={<OrderTracking />} />
              <Route path="/courier" element={<CourierDashboard />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
