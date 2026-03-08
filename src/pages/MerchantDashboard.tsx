import { useState } from "react";
import { merchantOrders, restaurants } from "@/data/mockData";
import { Link } from "react-router-dom";
import { ArrowLeft, Package, Clock, CheckCircle, Truck, ChefHat, CalendarDays, DollarSign, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "bg-amber-100 text-amber-700" },
  preparing: { label: "Preparing", icon: ChefHat, color: "bg-blue-100 text-blue-700" },
  ready: { label: "Ready", icon: Package, color: "bg-green-100 text-green-700" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "bg-muted text-muted-foreground" },
};

const MerchantDashboard = () => {
  const [orders, setOrders] = useState(merchantOrders);
  const restaurant = restaurants[0]; // Trattoria Bella

  const updateStatus = (orderId: string, newStatus: "pending" | "preparing" | "ready" | "delivered") => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success(`Order #${orderId} updated to ${newStatus}`);
  };

  const nextStatus = (current: string) => {
    const flow = ["pending", "preparing", "ready", "delivered"] as const;
    const idx = flow.indexOf(current as typeof flow[number]);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const todayRevenue = orders.reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter(o => o.status !== "delivered").length;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Merchant Dashboard</h1>
            <p className="text-sm text-muted-foreground">{restaurant.name}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Today's Revenue", value: `$${todayRevenue.toFixed(2)}`, icon: DollarSign, trend: "+12%" },
            { label: "Active Orders", value: activeOrders.toString(), icon: Package, trend: "" },
            { label: "Reservations", value: "8", icon: CalendarDays, trend: "+3 today" },
            { label: "Avg Rating", value: restaurant.rating.toString(), icon: TrendingUp, trend: `${restaurant.reviewCount} reviews` },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                {stat.trend && <span className="text-xs text-secondary font-medium">{stat.trend}</span>}
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Orders */}
          <div className="lg:col-span-2">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Live Orders</h2>
            <div className="space-y-3">
              {orders.map((order) => {
                const config = statusConfig[order.status];
                const next = nextStatus(order.status);
                return (
                  <motion.div
                    key={order.id}
                    layout
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                          <Users className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.time}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground">{order.items.join(", ")}</p>
                      <p className="text-sm font-semibold text-foreground mt-1">${order.total.toFixed(2)}</p>
                    </div>
                    {next && (
                      <button
                        onClick={() => updateStatus(order.id, next)}
                        className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        Mark as {statusConfig[next].label}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Menu & Reservations sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Menu Items</h3>
              <div className="space-y-2">
                {restaurant.menuItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                    </div>
                    <span className={`text-xs font-medium ${item.available ? "text-secondary" : "text-destructive"}`}>
                      {item.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Today's Reservations</h3>
              {[
                { name: "Table for 4", time: "6:30 PM", guest: "Johnson Family" },
                { name: "Table for 2", time: "7:00 PM", guest: "Date Night - Alex" },
                { name: "Table for 6", time: "8:00 PM", guest: "Birthday - Lisa" },
              ].map((res, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{res.guest}</p>
                    <p className="text-xs text-muted-foreground">{res.name}</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{res.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
