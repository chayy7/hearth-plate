import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { restaurants } from "@/data/mockData";
import { ArrowLeft, Star, Gift, Sparkles, Image as ImageIcon, ThumbsUp, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const FOOD_KEYWORDS = [
  "delicious", "fresh", "crispy", "tender", "flavorful", "juicy", "creamy", "spicy",
  "savory", "aromatic", "seasoned", "perfectly cooked", "rich", "moist", "crunchy",
  "texture", "portion", "presentation", "service", "ambiance", "atmosphere", "packaging",
  "temperature", "delivery", "speed", "quality", "value", "taste", "authentic",
];

const AI_PROMPTS: Record<string, string[]> = {
  Pizza: ["How was the crust texture?", "Was the cheese quality good?", "How about the sauce-to-cheese ratio?"],
  Pasta: ["Was the pasta cooked al dente?", "How was the sauce consistency?", "Was the portion satisfying?"],
  Sushi: ["How fresh was the fish?", "Was the rice properly seasoned?", "How was the presentation?"],
  Curry: ["How was the spice level?", "Was the sauce rich and flavorful?", "Did the naan complement the curry?"],
  default: ["How was the overall taste?", "Was the portion size adequate?", "How was the delivery packaging?", "Would you recommend this dish?"],
};

const WriteReview = () => {
  const { restaurantId } = useParams();
  const restaurant = restaurants.find(r => r.id === restaurantId);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const wordCount = reviewText.trim().split(/\s+/).filter(Boolean).length;

  const detectedKeywords = useMemo(() => {
    const lower = reviewText.toLowerCase();
    return FOOD_KEYWORDS.filter(kw => lower.includes(kw));
  }, [reviewText]);

  const points = useMemo(() => {
    let pts = 0;
    if (wordCount >= 20) pts += 5;
    if (wordCount >= 50) pts += 5;
    if (wordCount >= 100) pts += 10;
    pts += Math.min(detectedKeywords.length, 5) * 2; // up to 10 for keywords
    if (rating > 0) pts += 5;
    return pts;
  }, [wordCount, detectedKeywords, rating]);

  const pointsTier = points >= 25 ? "gold" : points >= 15 ? "silver" : points >= 5 ? "bronze" : "none";
  const tierConfig = {
    gold: { label: "Gold Review", color: "text-amber-600 bg-amber-50 border-amber-200" },
    silver: { label: "Silver Review", color: "text-muted-foreground bg-muted border-border" },
    bronze: { label: "Bronze Review", color: "text-primary bg-accent border-primary/20" },
    none: { label: "Keep writing!", color: "text-muted-foreground bg-muted border-border" },
  };

  // Get AI prompts based on restaurant cuisine
  const prompts = restaurant
    ? AI_PROMPTS[restaurant.menuItems[0]?.category] || AI_PROMPTS.default
    : AI_PROMPTS.default;

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Restaurant not found.</p>
        <Link to="/" className="text-primary mt-4 inline-block hover:underline">Go back</Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Review Submitted!</h2>
          <p className="text-muted-foreground mt-2">
            You earned <span className="font-bold text-primary">{points} points</span> for your {tierConfig[pointsTier].label.toLowerCase()}.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to={`/restaurant/${restaurant.id}`} className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Back to Restaurant
            </Link>
            <Link to="/" className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/restaurant/${restaurant.id}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Write a Review</h1>
            <p className="text-sm text-muted-foreground">{restaurant.name}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-8">
          <p className="text-sm font-medium text-foreground mb-2">Overall Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? "fill-primary text-primary"
                      : "text-border"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* AI Prompts */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">AI Suggestions — tap to add</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {prompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setReviewText(prev => prev + (prev ? " " : "") + prompt)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Text area */}
        <div className="mb-4">
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience — what did you love? What could be better?"
            rows={6}
            className="w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">{wordCount} words</p>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ImageIcon className="h-3.5 w-3.5" /> Add photo
            </button>
          </div>
        </div>

        {/* Detected keywords */}
        <AnimatePresence>
          {detectedKeywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <p className="text-xs text-muted-foreground mb-2">
                <ThumbsUp className="h-3 w-3 inline mr-1" />
                Great descriptive keywords detected:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {detectedKeywords.map(kw => (
                  <span key={kw} className="rounded-full bg-secondary/10 border border-secondary/30 px-2.5 py-0.5 text-xs font-medium text-secondary">
                    {kw}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Points preview */}
        <motion.div
          layout
          className={`rounded-2xl border p-5 mb-6 ${tierConfig[pointsTier].color}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm">{tierConfig[pointsTier].label}</p>
                <p className="text-xs opacity-75">
                  {pointsTier === "none"
                    ? "Add more details to earn points"
                    : pointsTier === "bronze"
                    ? "Add 50+ words for silver tier"
                    : pointsTier === "silver"
                    ? "Add keywords & 100+ words for gold"
                    : "Maximum reward tier reached!"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-heading text-2xl font-bold">{points}</p>
              <p className="text-xs opacity-75">points</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 rounded-full bg-foreground/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-current opacity-40"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((points / 30) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] opacity-50">
            <span>0</span>
            <span>Bronze (5)</span>
            <span>Silver (15)</span>
            <span>Gold (25+)</span>
          </div>
        </motion.div>

        {/* Submit */}
        <button
          onClick={() => {
            if (rating === 0) {
              toast.error("Please add a rating");
              return;
            }
            if (wordCount < 5) {
              toast.error("Please write at least 5 words");
              return;
            }
            setSubmitted(true);
          }}
          disabled={rating === 0 || wordCount < 5}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Review & Earn {points} Points
        </button>
      </div>
    </div>
  );
};

export default WriteReview;
