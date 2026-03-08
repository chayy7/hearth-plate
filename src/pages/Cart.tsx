import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, CalendarDays, Ticket, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { events } from "@/data/mockData";
import { useRestaurants } from "@/hooks/useRestaurants";

const Cart = () => {
  const { items, eventTickets, updateQuantity, removeItem, updateTicketQuantity, removeEventTicket, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const { data: restaurantsData = [] } = useRestaurants();

  const hasFoodItems = items.length > 0;
  const hasTickets = eventTickets.length > 0;
  const isEmpty = !hasFoodItems && !hasTickets;

  const deliveryFee = hasFoodItems ? 3.99 : 0;
  const serviceFee = (hasFoodItems || hasTickets) ? 1.99 : 0;
  const grandTotal = total + deliveryFee + serviceFee;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="font-heading text-2xl font-bold text-foreground">Your Cart</h1>
        </div>

        {isEmpty ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <p className="text-lg font-semibold text-foreground">Your cart is empty</p>
            <p className="text-muted-foreground mt-1">Browse restaurants and add delicious items</p>
            <Link to="/" className="mt-6 inline-block rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Explore Restaurants
            </Link>
          </motion.div>
        ) : (
          <div>
            {/* Food items */}
            {hasFoodItems && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Delivery from <span className="font-medium text-foreground">{items[0].restaurantName}</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {items.map(item => (
                      <motion.div key={item.menuItem.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{item.menuItem.name}</h3>
                          <p className="text-sm text-primary font-medium">${item.menuItem.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-full bg-muted px-2 py-1">
                            <button onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-border transition-colors">
                              <Minus className="h-3.5 w-3.5 text-foreground" />
                            </button>
                            <span className="text-sm font-semibold text-foreground w-5 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-border transition-colors">
                              <Plus className="h-3.5 w-3.5 text-foreground" />
                            </button>
                          </div>
                          <button onClick={() => { removeItem(item.menuItem.id); toast.info("Item removed"); }} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-destructive/10 transition-colors">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Event tickets */}
            {hasTickets && (
              <>
                {hasFoodItems && <div className="border-t border-border my-6" />}
                <div className="flex items-center gap-2 mb-4">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-medium">Event Tickets</p>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {eventTickets.map(ticket => (
                      <motion.div key={ticket.event.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                        <img src={ticket.event.image} alt={ticket.event.title} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm truncate">{ticket.event.title}</h3>
                          <p className="text-xs text-muted-foreground">{ticket.event.date}</p>
                          <p className="text-sm text-primary font-medium">${ticket.event.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-full bg-muted px-2 py-1">
                            <button onClick={() => updateTicketQuantity(ticket.event.id, ticket.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-border transition-colors">
                              <Minus className="h-3.5 w-3.5 text-foreground" />
                            </button>
                            <span className="text-sm font-semibold text-foreground w-5 text-center">{ticket.quantity}</span>
                            <button onClick={() => updateTicketQuantity(ticket.event.id, ticket.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-border transition-colors">
                              <Plus className="h-3.5 w-3.5 text-foreground" />
                            </button>
                          </div>
                          <button onClick={() => { removeEventTicket(ticket.event.id); toast.info("Ticket removed"); }} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-destructive/10 transition-colors">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Order summary */}
            <div className="mt-8 rounded-2xl border border-border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                {hasFoodItems && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Food subtotal</span>
                    <span className="text-foreground">${items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0).toFixed(2)}</span>
                  </div>
                )}
                {hasTickets && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event tickets</span>
                    <span className="text-foreground">${eventTickets.reduce((s, t) => s + t.event.price * t.quantity, 0).toFixed(2)}</span>
                  </div>
                )}
                {hasFoodItems && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery fee</span>
                    <span className="text-foreground">${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="text-foreground">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 mt-3 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-foreground text-lg">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!user && hasFoodItems) {
                    toast.error("Please sign in to place an order");
                    navigate("/auth");
                    return;
                  }

                  setPlacing(true);
                  try {
                    let createdOrderId: string | null = null;
                    if (user && hasFoodItems) {
                      const foodSubtotal = items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0);
                      const { data: order, error: orderErr } = await supabase
                        .from("orders")
                        .insert({
                          user_id: user.id,
                          restaurant_id: items[0].restaurantId,
                          restaurant_name: items[0].restaurantName,
                          subtotal: foodSubtotal,
                          delivery_fee: deliveryFee,
                          service_fee: serviceFee,
                          total: grandTotal,
                        })
                        .select("id")
                        .single();

                      if (orderErr) throw orderErr;
                      createdOrderId = order.id;

                      const orderItems = items.map(i => ({
                        order_id: order.id,
                        item_name: i.menuItem.name,
                        item_price: i.menuItem.price,
                        quantity: i.quantity,
                      }));

                      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
                      if (itemsErr) throw itemsErr;
                    }

                    toast.success("Order placed! 🎉");
                    clearCart();
                    navigate(createdOrderId ? `/tracking/${createdOrderId}` : "/");
                  } catch (err: any) {
                    toast.error(err.message || "Failed to place order");
                  } finally {
                    setPlacing(false);
                  }
                }}
                disabled={placing}
                className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {placing ? "Placing order..." : `Place Order · $${grandTotal.toFixed(2)}`}
              </button>
            </div>

            {/* Cross-sell: Reserve a table */}
            {hasFoodItems && (() => {
              const restaurant = restaurantsData.find(r => r.id === items[0].restaurantId);
              return restaurant?.hasTableReservation ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 rounded-2xl border border-border bg-accent/50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">Dine in instead?</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{restaurant.name} has tables available tonight.</p>
                      <Link to={`/restaurant/${restaurant.id}`} className="mt-2 inline-block rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                        Reserve a Table
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ) : null;
            })()}

            {/* Cross-sell: Events */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="font-semibold text-foreground text-sm">You might also enjoy</p>
              </div>
              <div className="space-y-3">
                {events.slice(0, 2).map(event => (
                  <Link key={event.id} to={`/event/${event.id}`} className="flex items-center gap-3 group">
                    <img src={event.image} alt={event.title} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.date} · ${event.price}</p>
                    </div>
                    <Ticket className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            </motion.div>

            <button onClick={() => { clearCart(); toast.info("Cart cleared"); }} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-destructive transition-colors">
              Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
