import { describe, it, expect } from "vitest";

/**
 * Integration-style tests for order workflow logic.
 * These test the data transformations without hitting the database.
 */

interface OrderItem {
  item_name: string;
  item_price: number;
  quantity: number;
}

function computeOrderTotals(items: OrderItem[], deliveryFee: number, serviceFeeRate: number) {
  const subtotal = items.reduce((sum, i) => sum + i.item_price * i.quantity, 0);
  const serviceFee = Math.round(subtotal * serviceFeeRate * 100) / 100;
  const total = subtotal + deliveryFee + serviceFee;
  return { subtotal, serviceFee, deliveryFee, total };
}

function buildPlaceOrderPayload(
  userId: string,
  restaurantId: string,
  restaurantName: string,
  items: OrderItem[],
  deliveryFee: number,
  serviceFeeRate: number
) {
  const totals = computeOrderTotals(items, deliveryFee, serviceFeeRate);
  return {
    _user_id: userId,
    _restaurant_id: restaurantId,
    _restaurant_name: restaurantName,
    _subtotal: totals.subtotal,
    _delivery_fee: totals.deliveryFee,
    _service_fee: totals.serviceFee,
    _total: totals.total,
    _items: items,
  };
}

const ORDER_STATUSES = ["placed", "accepted", "preparing", "ready", "in_transit", "delivered"] as const;

function isValidStatusTransition(current: string, next: string): boolean {
  const currentIdx = ORDER_STATUSES.indexOf(current as any);
  const nextIdx = ORDER_STATUSES.indexOf(next as any);
  if (currentIdx === -1 || nextIdx === -1) return false;
  return nextIdx === currentIdx + 1;
}

describe("Order Workflow", () => {
  describe("computeOrderTotals", () => {
    it("calculates subtotal from items", () => {
      const items = [
        { item_name: "Tacos", item_price: 9.99, quantity: 2 },
        { item_name: "Drink", item_price: 3.5, quantity: 1 },
      ];
      const result = computeOrderTotals(items, 2.99, 0.1);
      expect(result.subtotal).toBeCloseTo(23.48);
      expect(result.serviceFee).toBeCloseTo(2.35);
      expect(result.total).toBeCloseTo(28.82);
    });

    it("handles empty cart", () => {
      const result = computeOrderTotals([], 2.99, 0.1);
      expect(result.subtotal).toBe(0);
      expect(result.serviceFee).toBe(0);
      expect(result.total).toBe(2.99);
    });

    it("handles zero fees", () => {
      const items = [{ item_name: "Burger", item_price: 15, quantity: 1 }];
      const result = computeOrderTotals(items, 0, 0);
      expect(result.total).toBe(15);
    });
  });

  describe("buildPlaceOrderPayload", () => {
    it("builds a valid payload for the place_order RPC", () => {
      const items = [{ item_name: "Pizza", item_price: 18, quantity: 1 }];
      const payload = buildPlaceOrderPayload("user-123", "rest-1", "Pizza Place", items, 3, 0.1);
      expect(payload._user_id).toBe("user-123");
      expect(payload._restaurant_name).toBe("Pizza Place");
      expect(payload._subtotal).toBe(18);
      expect(payload._delivery_fee).toBe(3);
      expect(payload._service_fee).toBeCloseTo(1.8);
      expect(payload._total).toBeCloseTo(22.8);
      expect(payload._items).toHaveLength(1);
    });
  });

  describe("Order Status Transitions", () => {
    it("allows valid forward transitions", () => {
      expect(isValidStatusTransition("placed", "accepted")).toBe(true);
      expect(isValidStatusTransition("accepted", "preparing")).toBe(true);
      expect(isValidStatusTransition("preparing", "ready")).toBe(true);
      expect(isValidStatusTransition("ready", "in_transit")).toBe(true);
      expect(isValidStatusTransition("in_transit", "delivered")).toBe(true);
    });

    it("rejects backward transitions", () => {
      expect(isValidStatusTransition("accepted", "placed")).toBe(false);
      expect(isValidStatusTransition("delivered", "placed")).toBe(false);
    });

    it("rejects skipping statuses", () => {
      expect(isValidStatusTransition("placed", "preparing")).toBe(false);
      expect(isValidStatusTransition("placed", "delivered")).toBe(false);
    });

    it("rejects invalid statuses", () => {
      expect(isValidStatusTransition("placed", "cancelled")).toBe(false);
      expect(isValidStatusTransition("unknown", "accepted")).toBe(false);
    });
  });
});
