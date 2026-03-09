import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft, Navigation, Package, DollarSign, CheckCircle, MapPin, Clock,
  Truck, Loader2, Bike, Timer
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface AvailableDelivery {
  order_id: string;
  restaurant_name: string;
  restaurant_id: string;
  total: number;
  created_at: string;
}

interface Assignment {
  id: string;
  order_id: string;
  status: string;
  payout: number;
  simulated_progress: number;
  created_at: string;
  pickup_at: string | null;
  delivered_at: string | null;
}

const CourierDashboard = () => {
  const { user, hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [available, setAvailable] = useState<AvailableDelivery[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !hasRole("courier"))) {
      navigate("/auth");
    }
  }, [user, authLoading, hasRole, navigate]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [availRes, assignRes] = await Promise.all([
      supabase.rpc("get_available_deliveries"),
      supabase.from("delivery_assignments").select("*").eq("courier_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (availRes.data) setAvailable(availRes.data as AvailableDelivery[]);
    if (assignRes.data) setAssignments(assignRes.data as Assignment[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime for assignments
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("courier-assignments")
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_assignments" }, () => {
        fetchData();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => {
        // Refresh available when order statuses change
        supabase.rpc("get_available_deliveries").then(({ data }) => {
          if (data) setAvailable(data as AvailableDelivery[]);
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchData]);

  const acceptDelivery = async (orderId: string) => {
    if (!user) return;
    setAcceptingId(orderId);
    const payout = 5 + Math.random() * 8; // Random payout between $5-$13

    const { error } = await supabase.from("delivery_assignments").insert({
      order_id: orderId,
      courier_id: user.id,
      status: "accepted",
      payout: Math.round(payout * 100) / 100,
    });

    if (error) {
      toast.error(error.message.includes("duplicate") ? "Already assigned" : "Failed to accept");
    } else {
      // Update order status to in_transit
      await supabase.rpc("merchant_update_order_status", { _order_id: orderId, _new_status: "in_transit" });
      toast.success("Delivery accepted!");
      fetchData();
    }
    setAcceptingId(null);
  };

  const advanceDelivery = async (assignment: Assignment) => {
    if (assignment.status === "accepted") {
      // Mark as picked up
      const { error } = await supabase
        .from("delivery_assignments")
        .update({ status: "picked_up", pickup_at: new Date().toISOString() })
        .eq("id", assignment.id);
      if (!error) {
        toast.success("Marked as picked up!");
        fetchData();
      }
    } else if (assignment.status === "picked_up") {
      // Mark as delivered
      const { error } = await supabase
        .from("delivery_assignments")
        .update({ status: "delivered", delivered_at: new Date().toISOString() })
        .eq("id", assignment.id);
      if (!error) {
        await supabase.rpc("merchant_update_order_status", { _order_id: assignment.order_id, _new_status: "delivered" });
        toast.success(`Delivered! +$${assignment.payout.toFixed(2)}`);
        fetchData();
      }
    }
  };

  const activeAssignments = assignments.filter(a => a.status !== "delivered");
  const completedAssignments = assignments.filter(a => a.status === "delivered");
  const totalEarnings = completedAssignments.reduce((s, a) => s + Number(a.payout), 0);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Courier Dashboard</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="ml-auto flex h-3 w-3 rounded-full bg-secondary" title="Online" />
        </div>

        {/* Earnings summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
            <DollarSign className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="font-heading text-2xl font-bold text-foreground">${totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Earnings</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5">
            <Package className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="font-heading text-2xl font-bold text-foreground">{completedAssignments.length}</p>
            <p className="text-xs text-muted-foreground">Deliveries Completed</p>
          </motion.div>
        </div>

        {/* Active deliveries */}
        {activeAssignments.map((assignment) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-primary bg-card p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Navigation className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-lg font-semibold text-foreground">Active Delivery</h2>
              <span className="ml-auto rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                {assignment.status === "accepted" ? "Go to Restaurant" : "Deliver to Customer"}
              </span>
            </div>

            {/* Simulated progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{assignment.status === "accepted" ? "Heading to pickup" : "Delivering"}</span>
                <span>Order #{assignment.order_id.slice(0, 8)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: "10%" }}
                  animate={{ width: assignment.status === "accepted" ? "40%" : "75%" }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Timer className="h-3.5 w-3.5" /> ~15 min</span>
                <span className="font-semibold text-foreground">${Number(assignment.payout).toFixed(2)}</span>
              </div>
              <button
                onClick={() => advanceDelivery(assignment)}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {assignment.status === "accepted" ? "Picked Up" : "Mark Delivered"}
              </button>
            </div>
          </motion.div>
        ))}

        {/* Available deliveries */}
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
          Available Deliveries ({available.length})
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : available.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Bike className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No deliveries available right now.</p>
            <p className="text-xs text-muted-foreground mt-1">New orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {available.map((delivery, i) => (
              <motion.div
                key={delivery.order_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{delivery.restaurant_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Order #{delivery.order_id.slice(0, 8)} · {new Date(delivery.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">${Number(delivery.total).toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={() => acceptDelivery(delivery.order_id)}
                  disabled={!!acceptingId || activeAssignments.length > 0}
                  className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {acceptingId === delivery.order_id ? "Accepting..." : activeAssignments.length > 0 ? "Finish active delivery first" : "Accept Delivery"}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Completed */}
        {completedAssignments.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Completed ({completedAssignments.length})</h2>
            {completedAssignments.map(a => (
              <div key={a.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Order #{a.order_id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.delivered_at ? new Date(a.delivered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Completed"}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">+${Number(a.payout).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierDashboard;
