import { Link } from "react-router-dom";
import { ShoppingBag, MapPin, Search, User, LogOut, Trophy, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const { itemCount } = useCart();
  const { user, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-warm">
            <span className="text-lg font-bold text-primary-foreground">F</span>
          </div>
          <span className="font-heading text-xl font-bold text-foreground">Flavour</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 rounded-full bg-muted px-4 py-2 flex-1 max-w-md mx-8">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search restaurants, cuisines..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground ml-2" />
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Downtown</span>
          </button>

          <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors">
            <ShoppingBag className="h-5 w-5 text-foreground" />
            {itemCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </motion.span>
            )}
          </Link>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors"
            >
              {user ? (
                <span className="text-sm font-semibold text-foreground">
                  {(profile?.display_name || user.email || "U")[0].toUpperCase()}
                </span>
              ) : (
                <User className="h-5 w-5 text-foreground" />
              )}
            </button>

            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-card p-2 shadow-lg z-50"
              >
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-sm font-semibold text-foreground truncate">{profile?.display_name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                      <Package className="h-4 w-4" /> Order History
                    </Link>
                    <Link to="/rewards" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                      <Trophy className="h-4 w-4" /> Rewards
                    </Link>
                    <button onClick={() => { signOut(); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                      <User className="h-4 w-4" /> Sign In / Sign Up
                    </Link>
                    <Link to="/rewards" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                      <Trophy className="h-4 w-4" /> Rewards
                    </Link>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
