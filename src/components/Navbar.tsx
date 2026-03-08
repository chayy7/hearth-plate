import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, MapPin, Search, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

const Navbar = () => {
  const { itemCount } = useCart();
  const location = useLocation();

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
          <input
            type="text"
            placeholder="Search restaurants, cuisines..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground ml-2"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Downtown</span>
          </button>

          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors"
          >
            <ShoppingBag className="h-5 w-5 text-foreground" />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              >
                {itemCount}
              </motion.span>
            )}
          </Link>

          <Link to="/rewards" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors">
            <User className="h-5 w-5 text-foreground" />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
