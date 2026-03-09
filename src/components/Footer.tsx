import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Instagram, Twitter, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-xl font-bold mb-3">DineVerse</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Discover the best local restaurants, order with ease, and earn rewards with every bite.
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-background/10 hover:bg-background/20 transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: "/", label: "Restaurants" },
                { to: "/rewards", label: "Rewards" },
                { to: "/orders", label: "Order History" },
                { to: "/cart", label: "Cart" },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="opacity-70 hover:opacity-100 transition-opacity">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">Support</h4>
            <ul className="space-y-2.5 text-sm">
              {["Help Center", "Privacy Policy", "Terms of Service", "Partner with Us"].map(item => (
                <li key={item}>
                  <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 opacity-70">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>123 Food Street, Flavor City</span>
              </li>
              <li className="flex items-center gap-2 opacity-70">
                <Mail className="h-4 w-4 shrink-0" />
                <span>hello@dineverse.com</span>
              </li>
              <li className="flex items-center gap-2 opacity-70">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs opacity-50">© {new Date().getFullYear()} FoodDash. All rights reserved.</p>
          <p className="text-xs opacity-50">Made with 🧡 for food lovers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
