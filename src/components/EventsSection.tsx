import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import { events } from "@/data/mockData";
import { motion } from "framer-motion";

const EventsSection = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          Upcoming Events
        </h2>
        <Link to="/events" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link to={`/event/${event.id}`} className="block group">
              <div className="rounded-2xl bg-card border border-border overflow-hidden card-elevated">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 rounded-full bg-card/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-foreground">
                    ${event.price}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  <div className="mt-3 space-y-1.5">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" /> {event.date}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {event.time}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {event.venue}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {event.spotsLeft} spots left
                    </span>
                    <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${((event.totalSpots - event.spotsLeft) / event.totalSpots) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default EventsSection;
