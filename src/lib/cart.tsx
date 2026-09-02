"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { OrderItem } from "@/lib/types";

type Ctx = {
  items: OrderItem[];
  add: (item: Omit<OrderItem, "qty">, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  hydrated: boolean;
};
const CartCtx = createContext<Ctx | null>(null);
const KEY = "md-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw)); } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {} }, [items, hydrated]);

  const add = useCallback((item: Omit<OrderItem, "qty">, qty = 1) => {
    setItems((cur) => {
      const i = cur.findIndex((x) => x.slug === item.slug);
      if (i >= 0) return cur.map((x, k) => (k === i ? { ...x, qty: x.qty + qty } : x));
      return [...cur, { ...item, qty }];
    });
  }, []);
  const setQty = useCallback((slug: string, qty: number) => setItems((cur) => cur.map((x) => (x.slug === slug ? { ...x, qty: Math.max(1, qty) } : x))), []);
  const remove = useCallback((slug: string) => setItems((cur) => cur.filter((x) => x.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);
  const value = useMemo<Ctx>(() => ({
    items, add, setQty, remove, clear, hydrated,
    count: items.reduce((s, i) => s + i.qty, 0),
    subtotal: items.reduce((s, i) => s + i.price * i.qty, 0),
  }), [items, add, setQty, remove, clear, hydrated]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
