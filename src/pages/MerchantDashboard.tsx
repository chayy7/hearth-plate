import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft, Package, Clock, CheckCircle, Truck, ChefHat,
  DollarSign, TrendingUp, Users, Store, Loader2, UtensilsCrossed,
  ToggleLeft, ToggleRight, ShoppingBag, CircleDollarSign, Timer,
  BarChart3, PieChart
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart as RPieChart, Pie, Cell, Legend } from "recharts";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  placed: { label: "New Order", icon: ShoppingBag, color: "bg-amber-100 text-amber-700 border-amber-200" },
  accepted: { label: "Accepted", icon: Store, color: "bg-blue-100 text-blue-700 border-blue-200" },
  preparing: { label: "Preparing", icon: ChefHat, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  courier_assigned: { label: "Ready for Pickup", icon: Package, color: "bg-violet-100 text-violet-700 border-violet-200" },
  in_transit: { label: "In Transit", icon: Truck, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "bg-muted text-muted-foreground border-border" },
};

const STATUS_FLOW = ["placed", "accepted", "preparing", "courier_assigned", "in_transit", "delivered"] as const;
const PIE_COLORS = ["hsl(28, 85%, 56%)", "hsl(217, 91%, 60%)", "hsl(263, 70%, 60%)", "hsl(145, 63%, 42%)", "hsl(0, 0%, 70%)"];

interface OrderRow {
  id: string;
  status: string;
  restaurant_id: string;
  restaurant_name: string;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  total: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
}

interface MenuItemRow {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  description: string | null;
}

const MerchantDashboard = () => {
  const { user, hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemRow[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [restaurantRating, setRestaurantRating] = useState<number>(0);
  const [restaurantReviewCount, setRestaurantReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"live" | "menu" | "analytics">("live");
  const [orderFilter, setOrderFilter] = useState<"active" | "all" | "delivered">("active");

  useEffect(() => {
    if (!authLoading && (!user || !hasRole("merchant"))) {
      navigate("/merchant-auth");
    }
  }, [user, authLoading, hasRole, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchRestaurant = async () => {
      const { data } = await supabase.from("merchant_restaurants").select("restaurant_id").eq("user_id", user.id).single();
      if (data) {
        setRestaurantId(data.restaurant_id);
        const { data: r } = await supabase.from("restaurants").select("name, rating, review_count").eq("id", data.restaurant_id).single();
        if (r) {
          setRestaurantName(r.name);
          setRestaurantRating(Number(r.rating));
          setRestaurantReviewCount(r.review_count);
        }
      }
    };
    fetchRestaurant();
  }, [user]);

  const fetchData = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    const [ordersRes, itemsRes, menuRes] = await Promise.all([
      supabase.rpc("get_restaurant_orders", { _restaurant_id: restaurantId }),
      supabase.rpc("get_order_items_for_restaurant", { _restaurant_id: restaurantId }),
      supabase.from("menu_items").select("*").eq("restaurant_id", restaurantId),
    ]);
    if (ordersRes.data) setOrders(ordersRes.data as OrderRow[]);
    if (itemsRes.data) setOrderItems(itemsRes.data as OrderItemRow[]);
    if (menuRes.data) setMenuItems(menuRes.data as MenuItemRow[]);
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime orders
  useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel("merchant-orders-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          const row = payload.new as OrderRow;
          if (row.restaurant_id === restaurantId) {
            setOrders(prev => {
              const exists = prev.find(o => o.id === row.id);
              if (exists) return prev.map(o => o.id === row.id ? row : o);
              if (payload.eventType === "INSERT") {
                toast.info("New order received!", { duration: 5000 });
              }
              return [row, ...prev];
            });
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const { error } = await supabase.rpc("merchant_update_order_status", {
      _order_id: orderId,
      _new_status: newStatus,
    });
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Order → ${statusConfig[newStatus]?.label ?? newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
    setUpdatingId(null);
  };

  const nextStatus = (current: string) => {
    const idx = STATUS_FLOW.indexOf(current as typeof STATUS_FLOW[number]);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const itemsForOrder = (orderId: string) => orderItems.filter(i => i.order_id === orderId);

  // Analytics computations
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const deliveredOrders = orders.filter(o => o.status === "delivered");
  const activeOrders = orders.filter(o => o.status !== "delivered");
  const deliveryFeeRevenue = orders.reduce((s, o) => s + Number(o.delivery_fee), 0);
  const serviceFeeRevenue = orders.reduce((s, o) => s + Number(o.service_fee), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const filteredOrders = useMemo(() => {
    if (orderFilter === "active") return activeOrders;
    if (orderFilter === "delivered") return deliveredOrders;
    return orders;
  }, [orders, orderFilter, activeOrders, deliveredOrders]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      name: statusConfig[status]?.label || status,
      value: count,
    }));
  }, [orders]);

  // Revenue by hour (mock based on order times)
  const revenueByHour = useMemo(() => {
    const hours: Record<number, number> = {};
    orders.forEach(o => {
      const h = new Date(o.created_at).getHours();
      hours[h] = (hours[h] || 0) + Number(o.total);
    });
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      revenue: Math.round((hours[i] || 0) * 100) / 100,
    })).filter(h => h.revenue > 0);
  }, [orders]);

  // Menu category breakdown
  const menuByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItemRow[]>);

  if (authLoading || (!user && loading)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border hover:bg-muted transition-colors shrink-0">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">{restaurantName} — Admin Panel</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse" /> Live · Real-time updates
            </p>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, sub: `${orders.length} total orders` },
            { label: "Active Orders", value: activeOrders.length.toString(), icon: Timer, sub: "Being processed" },
            { label: "Delivered", value: deliveredOrders.length.toString(), icon: CheckCircle, sub: `$${deliveredOrders.reduce((s, o) => s + Number(o.total), 0).toFixed(2)} earned` },
            { label: "Avg Order", value: `$${avgOrderValue.toFixed(2)}`, icon: TrendingUp, sub: "Per order" },
            { label: "Rating", value: restaurantRating?.toString() ?? "—", icon: BarChart3, sub: `${restaurantReviewCount} reviews` },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-4">
              <stat.icon className="h-4 w-4 text-muted-foreground mb-1" />
              <p className="font-heading text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground/70">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-xl bg-muted p-1 w-fit">
          {([
            { key: "live", label: "Live Orders", icon: ShoppingBag },
            { key: "menu", label: "Menu", icon: UtensilsCrossed },
            { key: "analytics", label: "Analytics", icon: PieChart },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* LIVE ORDERS TAB */}
        {activeTab === "live" && (
          <>
            {/* Order filter pills */}
            <div className="flex gap-2 mb-4">
              {([
                { key: "active", label: `Active (${activeOrders.length})` },
                { key: "delivered", label: `Delivered (${deliveredOrders.length})` },
                { key: "all", label: `All (${orders.length})` },
              ] as const).map(f => (
                <button
                  key={f.key}
                  onClick={() => setOrderFilter(f.key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    orderFilter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No {orderFilter} orders</p>
                <p className="text-xs text-muted-foreground mt-1">Orders will appear here in real-time</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOrders.map((order) => {
                  const config = statusConfig[order.status] ?? statusConfig.placed;
                  const next = nextStatus(order.status);
                  const items = itemsForOrder(order.id);
                  const StatusIcon = config.icon;
                  const isNew = order.status === "placed";
                  return (
                    <motion.div
                      key={order.id}
                      layout
                      className={`rounded-xl border bg-card p-5 ${isNew ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isNew ? "bg-primary/10" : "bg-accent"}`}>
                            <StatusIcon className={`h-4 w-4 ${isNew ? "text-primary" : "text-accent-foreground"}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">#{order.id.slice(0, 8)}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {new Date(order.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium flex items-center gap-1 ${config.color}`}>
                          {config.label}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="mb-3 space-y-1">
                        {items.map(i => (
                          <div key={i.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{i.item_name} ×{i.quantity}</span>
                            <span className="text-foreground font-medium">${(i.item_price * i.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {items.length === 0 && <p className="text-xs text-muted-foreground">Loading items...</p>}
                      </div>

                      {/* Totals */}
                      <div className="border-t border-border pt-2 mb-3 space-y-0.5 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Delivery fee</span><span>${Number(order.delivery_fee).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Service fee</span><span>${Number(order.service_fee).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-foreground text-sm pt-1">
                          <span>Total</span><span>${Number(order.total).toFixed(2)}</span>
                        </div>
                      </div>

                      {next && (
                        <button
                          onClick={() => updateStatus(order.id, next)}
                          disabled={updatingId === order.id}
                          className={`w-full rounded-lg py-2.5 text-xs font-semibold transition-opacity disabled:opacity-50 ${
                            isNew
                              ? "bg-primary text-primary-foreground hover:opacity-90"
                              : "bg-foreground text-background hover:opacity-90"
                          }`}
                        >
                          {updatingId === order.id ? "Updating..." : `→ ${statusConfig[next]?.label ?? next}`}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* MENU TAB */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-3 capitalize">{category}</h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                        <p className="text-sm font-semibold text-foreground mt-1">${Number(item.price).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`text-xs font-medium ${item.available ? "text-secondary" : "text-destructive"}`}>
                          {item.available ? "Available" : "Unavailable"}
                        </span>
                        {item.available ? (
                          <ToggleRight className="h-6 w-6 text-secondary" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {menuItems.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                No menu items found.
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Revenue breakdown */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Food Revenue", value: `$${(totalRevenue - deliveryFeeRevenue - serviceFeeRevenue).toFixed(2)}`, icon: UtensilsCrossed },
                { label: "Delivery Fees", value: `$${deliveryFeeRevenue.toFixed(2)}`, icon: Truck },
                { label: "Service Fees", value: `$${serviceFeeRevenue.toFixed(2)}`, icon: CircleDollarSign },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-5">
                  <item.icon className="h-4 w-4 text-muted-foreground mb-2" />
                  <p className="font-heading text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Order Status Distribution */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-heading text-base font-semibold text-foreground mb-4">Order Status Distribution</h3>
                {statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RPieChart>
                      <Pie data={statusDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {statusDistribution.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RPieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">No order data yet</p>
                )}
              </div>

              {/* Revenue by Hour */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-heading text-base font-semibold text-foreground mb-4">Revenue by Hour</h3>
                {revenueByHour.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={revenueByHour}>
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                      <Bar dataKey="revenue" fill="hsl(28, 85%, 56%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">No revenue data yet</p>
                )}
              </div>
            </div>

            {/* Top selling items */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading text-base font-semibold text-foreground mb-4">Top Ordered Items</h3>
              {orderItems.length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(
                    orderItems.reduce((acc, i) => {
                      acc[i.item_name] = (acc[i.item_name] || 0) + i.quantity;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([name, qty], i) => (
                      <div key={name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                          <span className="text-sm text-foreground">{name}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">{qty} ordered</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No order data yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantDashboard;
