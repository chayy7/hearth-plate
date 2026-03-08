import { useParams, Link } from "react-router-dom";
import { events } from "@/data/mockData";
import { CalendarDays, Clock, MapPin, Users, ArrowLeft, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const EventDetail = () => {
  const { id } = useParams();
  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">Event not found.</p>
        <Link to="/" className="text-primary mt-4 inline-block hover:underline">Go back</Link>
      </div>
    );
  }

  const fillPercent = ((event.totalSpots - event.spotsLeft) / event.totalSpots) * 100;

  return (
    <div className="min-h-screen">
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground mb-2">
              {event.category}
            </span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground">{event.title}</h1>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                <CalendarDays className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-semibold text-foreground">{event.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                <Clock className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-semibold text-foreground">{event.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                <MapPin className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Venue</p>
                <p className="text-sm font-semibold text-foreground">{event.venue}</p>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed mb-8">{event.description}</p>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Price</p>
                <p className="font-heading text-3xl font-bold text-foreground">${event.price}</p>
              </div>
              <div className="text-right">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" /> {event.spotsLeft} of {event.totalSpots} spots left
                </p>
                <div className="mt-2 h-2 w-32 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${fillPercent}%` }} />
                </div>
              </div>
            </div>
            <button
              onClick={() => toast.success("Ticket booked! 🎉")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Ticket className="h-4 w-4" /> Book Ticket · ${event.price}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventDetail;
