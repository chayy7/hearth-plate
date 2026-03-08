import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Users, Clock, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const timeSlots = [
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM",
  "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
  "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM",
];

const partySizes = [1, 2, 3, 4, 5, 6, 7, 8];

interface ReservationModalProps {
  restaurantName: string;
  isOpen: boolean;
  onClose: () => void;
}

const ReservationModal = ({ restaurantName, isOpen, onClose }: ReservationModalProps) => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [step, setStep] = useState<"form" | "confirmed">("form");

  const canSubmit = date && time && partySize > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStep("confirmed");
    toast.success("Table reserved!");
  };

  const handleClose = () => {
    setStep("form");
    setDate(undefined);
    setTime("");
    setPartySize(2);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg"
          >
            {step === "form" ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">Reserve a Table</h2>
                    <p className="text-sm text-muted-foreground">{restaurantName}</p>
                  </div>
                  <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Party Size */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" /> Party Size
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {partySizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setPartySize(size)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
                          partySize === size
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" /> Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors hover:bg-muted",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {date ? format(date, "EEEE, MMMM d, yyyy") : "Select a date"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => d < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" /> Time
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setTime(slot)}
                        className={cn(
                          "rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                          time === slot
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Reservation
                </button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                    <CheckCircle className="h-8 w-8 text-secondary" />
                  </div>
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">Table Reserved!</h3>
                <p className="text-sm text-muted-foreground mt-2">{restaurantName}</p>
                <div className="mt-4 rounded-xl bg-muted p-4 text-left space-y-2">
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" /> {partySize} {partySize === 1 ? "guest" : "guests"}
                  </p>
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" /> {date && format(date, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" /> {time}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReservationModal;
