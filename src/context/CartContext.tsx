import React, { createContext, useContext, useState, useCallback } from "react";
import { CartItem, MenuItem, FoodEvent, EventTicketCartItem } from "@/data/mockData";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  eventTickets: EventTicketCartItem[];
  addItem: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  addEventTicket: (event: FoodEvent, quantity?: number) => void;
  removeEventTicket: (eventId: string) => void;
  updateTicketQuantity: (eventId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [eventTickets, setEventTickets] = useState<EventTicketCartItem[]>([]);

  const addItem = useCallback((item: MenuItem, restaurantId: string, restaurantName: string) => {
    setItems(prev => {
      if (prev.length > 0 && prev[0].restaurantId !== restaurantId) {
        toast.info("Cart cleared — items from a different restaurant were removed");
        return [{ menuItem: item, restaurantId, restaurantName, quantity: 1 }];
      }
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, restaurantId, restaurantName, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(i => i.menuItem.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.menuItem.id !== itemId));
    } else {
      setItems(prev => prev.map(i => i.menuItem.id === itemId ? { ...i, quantity } : i));
    }
  }, []);

  const addEventTicket = useCallback((event: FoodEvent, quantity = 1) => {
    setEventTickets(prev => {
      const existing = prev.find(t => t.event.id === event.id);
      if (existing) {
        return prev.map(t => t.event.id === event.id ? { ...t, quantity: t.quantity + quantity } : t);
      }
      return [...prev, { type: "event_ticket" as const, event, quantity }];
    });
  }, []);

  const removeEventTicket = useCallback((eventId: string) => {
    setEventTickets(prev => prev.filter(t => t.event.id !== eventId));
  }, []);

  const updateTicketQuantity = useCallback((eventId: string, quantity: number) => {
    if (quantity <= 0) {
      setEventTickets(prev => prev.filter(t => t.event.id !== eventId));
    } else {
      setEventTickets(prev => prev.map(t => t.event.id === eventId ? { ...t, quantity } : t));
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setEventTickets([]);
  }, []);

  const foodTotal = items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);
  const ticketTotal = eventTickets.reduce((sum, t) => sum + t.event.price * t.quantity, 0);
  const total = foodTotal + ticketTotal;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0) + eventTickets.reduce((sum, t) => sum + t.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, eventTickets, addItem, removeItem, updateQuantity,
      addEventTicket, removeEventTicket, updateTicketQuantity,
      clearCart, total, itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
