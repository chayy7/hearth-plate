import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import RestaurantDetail from "./pages/RestaurantDetail";
import EventDetail from "./pages/EventDetail";
import Cart from "./pages/Cart";
import MerchantDashboard from "./pages/MerchantDashboard";
import WriteReview from "./pages/WriteReview";
import OrderTracking from "./pages/OrderTracking";
import CourierDashboard from "./pages/CourierDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
