import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft, Package, Clock, CheckCircle, Truck, ChefHat, CalendarDays,
  DollarSign, TrendingUp, Users, BarChart3, MessageSquare, Zap, Target,
  Store, Loader2, UtensilsCrossed, ToggleLeft, ToggleRight
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  placed: { label: "Placed", icon: Clock, color: "bg-amber-100 text-amber-700" },
  accepted: { label: "Accepted", icon: Store, color: "bg-blue-100 text-blue-700" },
  preparing: { label: "Preparing", icon: ChefHat, color: "bg-blue-100 text-blue-700" },
  courier_assigned: { label: "Ready / Courier", icon: Package, color: "bg-violet-100 text-violet-700" },
  in_transit: { label: "In Transit", icon: Truck, color: "bg-green-100 text-green-700" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "bg-muted text-muted-foreground" },
};

const STATUS_FLOW = ["placed", "accepted", "preparing", "courier_assigned", "in_transit", "delivered"] as const;

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
  const [activeTab, setActiveTab] = useState<"orders" | "menu" | "analytics">("orders");

  // Check authorization
  useEffect(() => {
    if (!authLoading && (!user || !hasRole("merchant"))) {
      navigate("/auth");
    }
  }, [user, authLoading, hasRole, navigate]);

  // Fetch merchant's restaurant
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

  // Fetch orders & menu for restaurant
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

  // Realtime
  useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel("merchant-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          const row = payload.new as OrderRow;
          if (row.restaurant_id === restaurantId) {
            setOrders(prev => {
              const exists = prev.find(o => o.id === row.id);
              if (exists) return prev.map(o => o.id === row.id ? row : o);
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
      toast.success(`Order updated to ${statusConfig[newStatus]?.label ?? newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
    setUpdatingId(null);
  };

  const nextStatus = (current: string) => {
    const idx = STATUS_FLOW.indexOf(current as typeof STATUS_FLOW[number]);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const itemsForOrder = (orderId: string) => orderItems.filter(i => i.order_id === orderId);

  const todayRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const activeOrders = orders.filter(o => o.status !== "delivered").length;

  // Group menu by category
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-bold text-foreground">Merchant Dashboard</h1>
            <p className="text-sm text-muted-foreground">{restaurantName}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { label: "Revenue", value: `$${todayRevenue.toFixed(2)}`, icon: DollarSign, trend: `${orders.length} orders` },
            { label: "Active Orders", value: activeOrders.toString(), icon: Package, trend: "" },
            { label: "Menu Items", value: menuItems.length.toString(), icon: UtensilsCrossed, trend: `${menuItems.filter(m => m.available).length} active` },
            { label: "Avg Rating", value: restaurantRating?.toString() ?? "—", icon: TrendingUp, trend: `${restaurantReviewCount} reviews` },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                {stat.trend && <span className="text-xs text-secondary font-medium">{stat.trend}</span>}
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-xl bg-muted p-1 w-fit">
          {(["orders", "menu", "analytics"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                No orders yet for this restaurant.
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {orders.map((order) => {
                  const config = statusConfig[order.status] ?? statusConfig.placed;
                  const next = nextStatus(order.status);
                  const items = itemsForOrder(order.id);
                  const StatusIcon = config.icon;
                  return (
                    <motion.div key={order.id} layout className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                            <Users className="h-4 w-4 text-accent-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1 ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground">
                          {items.length > 0
                            ? items.map(i => `${i.item_name} ×${i.quantity}`).join(", ")
                            : "Loading items..."}
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-1">${Number(order.total).toFixed(2)}</p>
                      </div>
                      {next && (
                        <button
                          onClick={() => updateStatus(order.id, next)}
                          disabled={updatingId === order.id}
                          className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {updatingId === order.id ? "Updating..." : `Mark as ${statusConfig[next]?.label ?? next}`}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Menu Tab */}
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
                          <ToggleRight className="h-6 w-6 text-secondary cursor-pointer" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-muted-foreground cursor-pointer" />
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

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Review Conversion", value: "34%", desc: "Orders with reviews", icon: MessageSquare, change: "+4.2%" },
                { label: "Avg Order Value", value: `$${orders.length > 0 ? (todayRevenue / orders.length).toFixed(2) : "0"}`, desc: "Per order", icon: Zap, change: "" },
                { label: "Avg Review Length", value: "187", desc: "Characters per review", icon: Target, change: "+23 chars" },
                { label: "Order Completion", value: "96.4%", desc: "Successful deliveries", icon: CheckCircle, change: "+1.1%" },
              ].map((kpi, i) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                    {kpi.change && <span className="text-xs font-medium text-secondary">{kpi.change}</span>}
                  </div>
                  <p className="font-heading text-2xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-heading text-base font-semibold text-foreground mb-4">Weekly Revenue</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { day: "Mon", revenue: 320 }, { day: "Tue", revenue: 450 }, { day: "Wed", revenue: 380 },
                    { day: "Thu", revenue: 520 }, { day: "Fri", revenue: 680 }, { day: "Sat", revenue: 790 }, { day: "Sun", revenue: 620 },
                  ]}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="hsl(28, 85%, 56%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-heading text-base font-semibold text-foreground mb-4">Review Quality Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={[
                    { week: "W1", avgLength: 120, convRate: 28 }, { week: "W2", avgLength: 135, convRate: 29 },
                    { week: "W3", avgLength: 155, convRate: 31 }, { week: "W4", avgLength: 170, convRate: 32 },
                    { week: "W5", avgLength: 180, convRate: 33 }, { week: "W6", avgLength: 187, convRate: 34 },
                  ]}>
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgLength" stroke="hsl(28, 85%, 56%)" strokeWidth={2} dot={{ r: 4 }} name="Avg Length" />
                    <Line type="monotone" dataKey="convRate" stroke="hsl(145, 20%, 45%)" strokeWidth={2} dot={{ r: 4 }} name="Conv Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantDashboard;
