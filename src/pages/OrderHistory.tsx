import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Package, Clock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface OrderRow {
  id: string;
  restaurant_name: string;
  status: string;
  total: number;
  created_at: string;
  order_items: { item_name: string; quantity: number }[];
}

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(item_name, quantity)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as unknown as OrderRow[]) || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const statusIcon = (status: string) => {
    if (status === "delivered") return <CheckCircle className="h-4 w-4 text-secondary" />;
    return <Clock className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="font-heading text-2xl font-bold text-foreground">Order History</h1>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <p className="text-lg font-semibold text-foreground">No orders yet</p>
            <p className="text-muted-foreground mt-1">Your order history will appear here</p>
            <Link to="/" className="mt-6 inline-block rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Browse Restaurants
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{order.restaurant_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {statusIcon(order.status)}
                    <span className="text-xs font-medium capitalize text-foreground">{order.status.replace("_", " ")}</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {order.order_items.map((item, i) => (
                    <span key={i}>{i > 0 ? ", " : ""}{item.item_name} x{item.quantity}</span>
                  ))}
                </div>
                <p className="text-sm font-semibold text-foreground">${Number(order.total).toFixed(2)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
