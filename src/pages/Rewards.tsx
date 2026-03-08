import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, Star, Gift, Flame, ChevronRight, Sparkles, Crown, Ticket, Coffee, Percent, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const TIERS = [
  { name: "Bronze", min: 0, max: 199, color: "text-primary bg-accent border-primary/20", icon: Star },
  { name: "Silver", min: 200, max: 499, color: "text-muted-foreground bg-muted border-border", icon: Trophy },
  { name: "Gold", min: 500, max: 999, color: "text-amber-600 bg-amber-50 border-amber-200", icon: Crown },
  { name: "Platinum", min: 1000, max: Infinity, color: "text-violet-600 bg-violet-50 border-violet-200", icon: Flame },
];

const OFFERS = [
  { id: "o1", title: "Free Dessert", description: "Redeem at any partner restaurant", cost: 50, icon: Coffee, category: "Food" },
  { id: "o2", title: "15% Off Next Order", description: "Valid on orders over $20", cost: 100, icon: Percent, category: "Discount" },
  { id: "o3", title: "Free Delivery", description: "Skip the delivery fee on your next order", cost: 75, icon: Utensils, category: "Delivery" },
  { id: "o4", title: "Event Ticket Discount", description: "$10 off any food event ticket", cost: 150, icon: Ticket, category: "Events" },
  { id: "o5", title: "Premium Tasting Menu", description: "Exclusive 5-course experience for two", cost: 300, icon: Sparkles, category: "Exclusive" },
  { id: "o6", title: "Double Points Weekend", description: "Earn 2x points on all orders this weekend", cost: 200, icon: Flame, category: "Booster" },
];

const HISTORY = [
  { label: "Reviewed Trattoria Bella", points: 35, date: "2 days ago" },
  { label: "Ordered from Sakura Sushi", points: 15, date: "4 days ago" },
  { label: "Reviewed Spice Route", points: 45, date: "1 week ago" },
  { label: "Booked Wine Tasting Event", points: 20, date: "1 week ago" },
  { label: "Reviewed El Fuego Taqueria", points: 30, date: "2 weeks ago" },
  { label: "Referred a friend", points: 50, date: "2 weeks ago" },
];

const Rewards = () => {
  const [totalPoints] = useState(285);
  const [availablePoints, setAvailablePoints] = useState(285);

  const currentTier = TIERS.find(t => totalPoints >= t.min && totalPoints <= t.max) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const tierProgress = nextTier
    ? ((totalPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const TierIcon = currentTier.icon;

  const handleRedeem = (offer: typeof OFFERS[0]) => {
    if (availablePoints < offer.cost) {
      toast.error("Not enough points");
      return;
    }
    setAvailablePoints(prev => prev - offer.cost);
    toast.success(`Redeemed "${offer.title}"! Check your email for details.`);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="font-heading text-2xl font-bold text-foreground">Loyalty Rewards</h1>
        </div>

        {/* Points hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl gradient-warm p-6 text-primary-foreground mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80">Available Points</p>
              <p className="font-heading text-5xl font-bold mt-1">{availablePoints}</p>
              <div className="flex items-center gap-2 mt-3">
                <TierIcon className="h-5 w-5" />
                <span className="text-sm font-semibold">{currentTier.name} Member</span>
              </div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Gift className="h-8 w-8" />
            </div>
          </div>

          {/* Tier progress */}
          {nextTier && (
            <div className="relative mt-6">
              <div className="flex justify-between text-xs opacity-75 mb-1.5">
                <span>{currentTier.name}</span>
                <span>{nextTier.name} — {nextTier.min - totalPoints} pts away</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-white/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${tierProgress}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Tier overview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
          <h2 className="font-heading text-lg font-bold text-foreground mb-4">Tier Benefits</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TIERS.map(tier => {
              const Icon = tier.icon;
              const isActive = tier.name === currentTier.name;
              return (
                <div
                  key={tier.name}
                  className={`rounded-xl border p-4 text-center transition-colors ${
                    isActive ? tier.color + " ring-2 ring-current/20" : "border-border bg-card"
                  }`}
                >
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${isActive ? "" : "text-muted-foreground"}`} />
                  <p className={`text-sm font-semibold ${isActive ? "" : "text-foreground"}`}>{tier.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tier.max === Infinity ? `${tier.min}+ pts` : `${tier.min}–${tier.max} pts`}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Redeemable offers */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="font-heading text-lg font-bold text-foreground mb-4">Redeem Rewards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OFFERS.map(offer => {
              const Icon = offer.icon;
              const canAfford = availablePoints >= offer.cost;
              return (
                <motion.div
                  key={offer.id}
                  whileHover={{ scale: 1.01 }}
                  className="rounded-xl border border-border bg-card p-4 flex items-start gap-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
                    <Icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{offer.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{offer.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-semibold text-primary">{offer.cost} pts</span>
                      <button
                        onClick={() => handleRedeem(offer)}
                        disabled={!canAfford}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition-opacity ${
                          canAfford
                            ? "bg-primary text-primary-foreground hover:opacity-90"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        {canAfford ? "Redeem" : "Not enough"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Points history */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-8">
          <h2 className="font-heading text-lg font-bold text-foreground mb-4">Points History</h2>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border">
            {HISTORY.map((entry, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.label}</p>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                </div>
                <span className="text-sm font-semibold text-primary">+{entry.points}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* How to earn */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-8 mb-12">
          <h2 className="font-heading text-lg font-bold text-foreground mb-4">How to Earn Points</h2>
          <div className="space-y-3">
            {[
              { action: "Write a detailed review", pts: "Up to 45 pts", desc: "Add photos, tags, and 100+ words for gold-tier reviews" },
              { action: "Place a delivery order", pts: "10–20 pts", desc: "Points scale with order value" },
              { action: "Reserve a table", pts: "15 pts", desc: "Earn points for every completed reservation" },
              { action: "Attend a food event", pts: "20 pts", desc: "Get bonus points for event participation" },
              { action: "Refer a friend", pts: "50 pts", desc: "Both you and your friend earn points" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-primary">{item.pts}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Rewards;
