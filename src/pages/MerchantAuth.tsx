import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Store, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface RestaurantOption {
  id: string;
  name: string;
}

const MerchantAuth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from("restaurants").select("id, name").order("name").then(({ data }) => {
      if (data) setRestaurants(data);
    });
  }, []);

  // Redirect if already logged in as merchant
  useEffect(() => {
    if (user && hasRole("merchant")) {
      navigate("/merchant");
    }
  }, [user, hasRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        // Wait briefly for roles to load then redirect
        setTimeout(() => navigate("/merchant"), 500);
      }
    } else {
      if (!selectedRestaurant) {
        toast.error("Please select your restaurant");
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("Account created! Check your email to verify, then sign in.");
      setMode("login");
    }
    setLoading(false);
  };

  // After signup + email verification + login, link restaurant
  useEffect(() => {
    const linkRestaurant = async () => {
      if (!user || !selectedRestaurant) return;

      // Assign merchant role
      await supabase.from("user_roles").upsert(
        { user_id: user.id, role: "merchant" as any },
        { onConflict: "user_id,role" }
      );

      // Link restaurant
      await supabase.from("merchant_restaurants").upsert(
        { user_id: user.id, restaurant_id: selectedRestaurant },
        { onConflict: "user_id,restaurant_id" }
      );

      navigate("/merchant");
    };

    if (user && selectedRestaurant && mode === "login") {
      linkRestaurant();
    }
  }, [user, selectedRestaurant, mode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-6">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-warm">
                <Store className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {mode === "login" ? "Restaurant Admin Login" : "Register Your Restaurant"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login" ? "Access your restaurant admin panel" : "Create an admin account for your restaurant"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Restaurant owner name"
                      required
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Select Restaurant</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      value={selectedRestaurant}
                      onChange={e => setSelectedRestaurant(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-10 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                    >
                      <option value="">Choose your restaurant...</option>
                      {restaurants.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@yourrestaurant.com"
                  required
                  className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-border bg-background pl-10 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign In to Admin Panel" : "Register Restaurant"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? "New restaurant?" : "Already registered?"}{" "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-primary font-medium hover:underline">
              {mode === "login" ? "Register here" : "Sign in"}
            </button>
          </p>

          <div className="mt-4 pt-4 border-t border-border text-center">
            <Link to="/auth" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Are you a customer? Sign in here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MerchantAuth;
