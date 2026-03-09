import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

const Index = lazy(() => import("./pages/Index"));
const RestaurantDetail = lazy(() => import("./pages/RestaurantDetail"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const MerchantDashboard = lazy(() => import("./pages/MerchantDashboard"));
const MerchantAuth = lazy(() => import("./pages/MerchantAuth"));
const WriteReview = lazy(() => import("./pages/WriteReview"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const Rewards = lazy(() => import("./pages/Rewards"));
const Auth = lazy(() => import("./pages/Auth"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/event/:id" element={<EventDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/merchant" element={<MerchantDashboard />} />
                <Route path="/merchant-auth" element={<MerchantAuth />} />
                <Route path="/review/:restaurantId" element={<WriteReview />} />
                <Route path="/tracking/:orderId?" element={<OrderTracking />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
