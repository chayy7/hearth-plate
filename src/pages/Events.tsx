import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { events } from "@/data/mockData";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

const Events = () => {
  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              All Food Events
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Discover tastings, masterclasses, and live culinary experiences.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
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
                    <h2 className="font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {event.title}
                    </h2>
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
                          style={{
                            width: `${((event.totalSpots - event.spotsLeft) / event.totalSpots) * 100}%`,
                          }}
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
      <Footer />
    </div>
  );
};

export default Events;

