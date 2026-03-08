import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Phone, CheckCircle, ChefHat, Truck, Package, Store } from "lucide-react";
import { motion } from "framer-motion";

const ORDER_STEPS = [
  { key: "placed", label: "Order Placed", icon: CheckCircle, description: "Your order has been confirmed" },
  { key: "accepted", label: "Restaurant Accepted", icon: Store, description: "The restaurant is reviewing your order" },
  { key: "preparing", label: "Preparing", icon: ChefHat, description: "Your food is being freshly prepared" },
  { key: "courier_assigned", label: "Courier Assigned", icon: Package, description: "A courier is heading to the restaurant" },
  { key: "in_transit", label: "On the Way", icon: Truck, description: "Your order is on its way to you" },
  { key: "delivered", label: "Delivered", icon: CheckCircle, description: "Enjoy your meal!" },
];

const OrderTracking = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Simulate order progression
  useEffect(() => {
    if (currentStep >= ORDER_STEPS.length - 1) return;
    const delays = [3000, 5000, 8000, 6000, 10000]; // ms between steps
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, delays[currentStep] || 5000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  useEffect(() => {
    const timer = setInterval(() => setElapsedMinutes(prev => prev + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const estimatedTime = currentStep < 5 ? `${25 - currentStep * 4}-${35 - currentStep * 4} min` : "Arrived!";

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Order Tracking</h1>
            <p className="text-sm text-muted-foreground">Order #FL-2847</p>
          </div>
        </div>

        {/* Simulated Map */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-muted overflow-hidden mb-8 relative"
          style={{ height: 220 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
                {currentStep >= 4 ? (
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary"
                  >
                    <Truck className="h-7 w-7 text-primary-foreground" />
                  </motion.div>
                ) : (
                  <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-accent">
                    <MapPin className="h-7 w-7 text-accent-foreground" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-foreground mt-3">
                {currentStep < 4 ? "Trattoria Bella" : "Courier en route"}
              </p>
              <p className="text-xs text-muted-foreground">42 Via Roma Street</p>
            </div>
          </div>

          {/* Estimated time badge */}
          <div className="absolute top-3 right-3 rounded-full bg-card border border-border px-3 py-1.5 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">{estimatedTime}</span>
          </div>
        </motion.div>

        {/* Status Steps */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-6">Order Status</h3>
          <div className="space-y-0">
            {ORDER_STEPS.map((step, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              const isFuture = i > currentStep;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex gap-4">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isDone || isActive ? "hsl(28, 85%, 56%)" : "hsl(var(--muted))",
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    >
                      <StepIcon className={`h-4 w-4 ${isDone || isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </motion.div>
                    {i < ORDER_STEPS.length - 1 && (
                      <div className={`w-0.5 h-10 ${isDone ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-8 pt-1">
                    <p className={`text-sm font-semibold ${isFuture ? "text-muted-foreground" : "text-foreground"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1"
                      >
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> In progress
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <h3 className="font-heading text-base font-semibold text-foreground mb-3">Order Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Margherita Pizza</span>
              <span className="text-foreground">$14.99</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Carbonara</span>
              <span className="text-foreground">$16.99</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 mt-2">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-semibold text-foreground">$37.97</span>
            </div>
          </div>
        </div>

        {/* Courier contact */}
        {currentStep >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                <span className="text-sm font-bold text-accent-foreground">MR</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Marco R.</p>
                <p className="text-xs text-muted-foreground">Your courier</p>
              </div>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary hover:opacity-90 transition-opacity">
              <Phone className="h-4 w-4 text-primary-foreground" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
