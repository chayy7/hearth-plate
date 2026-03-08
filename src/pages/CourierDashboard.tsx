import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Navigation, Package, DollarSign, CheckCircle, MapPin, Clock, Phone, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface DeliveryJob {
  id: string;
  restaurant: string;
  restaurantAddress: string;
  customer: string;
  customerAddress: string;
  items: string[];
  payout: number;
  distance: string;
  status: "available" | "accepted" | "picked_up" | "delivered";
}

const initialJobs: DeliveryJob[] = [
  {
    id: "d1",
    restaurant: "Trattoria Bella",
    restaurantAddress: "42 Via Roma Street",
    customer: "Alex W.",
    customerAddress: "15 Maple Drive, Apt 3B",
    items: ["Margherita Pizza", "Carbonara"],
    payout: 8.50,
    distance: "2.4 km",
    status: "available",
  },
  {
    id: "d2",
    restaurant: "Sakura Sushi House",
    restaurantAddress: "88 Zen Garden Lane",
    customer: "Lisa M.",
    customerAddress: "220 Oak Avenue",
    items: ["Omakase Set", "Edamame"],
    payout: 10.25,
    distance: "3.1 km",
    status: "available",
  },
  {
    id: "d3",
    restaurant: "Spice Route",
    restaurantAddress: "29 Saffron Road",
    customer: "Tom B.",
    customerAddress: "7 Pine Street",
    items: ["Butter Chicken", "Garlic Naan x2"],
    payout: 7.75,
    distance: "1.8 km",
    status: "available",
  },
];

const CourierDashboard = () => {
  const [jobs, setJobs] = useState(initialJobs);
  const [activeJob, setActiveJob] = useState<string | null>(null);

  const todayEarnings = 42.50;
  const completedToday = 5;

  const acceptJob = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: "accepted" } : j));
    setActiveJob(jobId);
    toast.success("Delivery accepted!");
  };

  const advanceJob = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      if (j.status === "accepted") return { ...j, status: "picked_up" };
      if (j.status === "picked_up") {
        setActiveJob(null);
        toast.success(`Delivered to ${j.customer}! +$${j.payout.toFixed(2)}`);
        return { ...j, status: "delivered" };
      }
      return j;
    }));
  };

  const currentJob = jobs.find(j => j.id === activeJob);
  const availableJobs = jobs.filter(j => j.status === "available");
  const completedJobs = jobs.filter(j => j.status === "delivered");

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Courier Dashboard</h1>
            <p className="text-sm text-muted-foreground">Marco R. · Online</p>
          </div>
          <div className="ml-auto flex h-3 w-3 rounded-full bg-secondary" title="Online" />
        </div>

        {/* Earnings summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
            <DollarSign className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="font-heading text-2xl font-bold text-foreground">${todayEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Today's Earnings</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5">
            <Package className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="font-heading text-2xl font-bold text-foreground">{completedToday + completedJobs.length}</p>
            <p className="text-xs text-muted-foreground">Deliveries Completed</p>
          </motion.div>
        </div>

        {/* Active delivery */}
        {currentJob && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-primary bg-card p-6 mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Navigation className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-lg font-semibold text-foreground">Active Delivery</h2>
              <span className="ml-auto rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                {currentJob.status === "accepted" ? "Go to Restaurant" : "Deliver to Customer"}
              </span>
            </div>

            <div className="space-y-4">
              {/* From */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{currentJob.restaurant}</p>
                  <p className="text-xs text-muted-foreground">{currentJob.restaurantAddress}</p>
                  {currentJob.status === "accepted" && (
                    <p className="text-xs text-muted-foreground mt-1">Pick up: {currentJob.items.join(", ")}</p>
                  )}
                </div>
              </div>

              <div className="ml-4 h-6 w-0.5 bg-border" />

              {/* To */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 mt-0.5">
                  <MapPin className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{currentJob.customer}</p>
                  <p className="text-xs text-muted-foreground">{currentJob.customerAddress}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {currentJob.distance}</span>
                <span className="font-semibold text-foreground">${currentJob.payout.toFixed(2)}</span>
              </div>
              <button
                onClick={() => advanceJob(currentJob.id)}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {currentJob.status === "accepted" ? "Picked Up" : "Mark Delivered"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Available deliveries */}
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
          {activeJob ? "Other Available" : "Available Deliveries"} ({availableJobs.length})
        </h2>

        {availableJobs.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No deliveries available right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableJobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{job.restaurant}</p>
                    <p className="text-xs text-muted-foreground">{job.items.join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">${job.payout.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{job.distance}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {job.customerAddress}
                  </p>
                  <button
                    onClick={() => acceptJob(job.id)}
                    disabled={!!activeJob}
                    className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Accept
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Completed */}
        {completedJobs.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Completed ({completedJobs.length})</h2>
            {completedJobs.map(job => (
              <div key={job.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{job.restaurant} → {job.customer}</p>
                    <p className="text-xs text-muted-foreground">{job.items.join(", ")}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">+${job.payout.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierDashboard;
