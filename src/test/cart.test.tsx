import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "@/context/CartContext";
import type { MenuItem, FoodEvent } from "@/data/mockData";

const mockItem: MenuItem = {
  id: "item-1",
  name: "Tacos",
  description: "Delicious tacos",
  price: 9.99,
  category: "Main",
  available: true,
};

const mockItem2: MenuItem = {
  id: "item-2",
  name: "Burrito",
  description: "Large burrito",
  price: 12.5,
  category: "Main",
  available: true,
};

const mockEvent: FoodEvent = {
  id: "event-1",
  title: "Taco Festival",
  description: "A festival",
  date: "2026-04-01",
  time: "6:00 PM",
  location: "Downtown",
  price: 25,
  image: "/event-1.jpg",
  capacity: 100,
  tags: ["food"],
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe("Cart Context", () => {
  it("starts with empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it("adds an item and computes total", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockItem, "rest-1", "Taco Place"));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.total).toBeCloseTo(9.99);
    expect(result.current.itemCount).toBe(1);
  });

  it("increments quantity when adding same item twice", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockItem, "rest-1", "Taco Place"));
    act(() => result.current.addItem(mockItem, "rest-1", "Taco Place"));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.total).toBeCloseTo(19.98);
  });

  it("clears cart when adding from different restaurant", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockItem, "rest-1", "Taco Place"));
    act(() => result.current.addItem(mockItem2, "rest-2", "Burrito Bar"));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].menuItem.id).toBe("item-2");
  });

  it("removes an item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockItem, "rest-1", "Taco Place"));
    act(() => result.current.removeItem("item-1"));
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it("updates quantity and removes when zero", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockItem, "rest-1", "Taco Place"));
    act(() => result.current.updateQuantity("item-1", 5));
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.total).toBeCloseTo(49.95);
    act(() => result.current.updateQuantity("item-1", 0));
    expect(result.current.items).toHaveLength(0);
  });

  it("handles event tickets", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addEventTicket(mockEvent, 2));
    expect(result.current.eventTickets).toHaveLength(1);
    expect(result.current.eventTickets[0].quantity).toBe(2);
    expect(result.current.total).toBeCloseTo(50);
    expect(result.current.itemCount).toBe(2);
  });

  it("clears all items and tickets", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockItem, "rest-1", "Taco Place"));
    act(() => result.current.addEventTicket(mockEvent));
    act(() => result.current.clearCart());
    expect(result.current.items).toHaveLength(0);
    expect(result.current.eventTickets).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it("computes combined total of food + tickets", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockItem, "rest-1", "Taco Place")); // 9.99
    act(() => result.current.addEventTicket(mockEvent)); // 25
    expect(result.current.total).toBeCloseTo(34.99);
    expect(result.current.itemCount).toBe(2);
  });
});
