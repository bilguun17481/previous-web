import { supabaseAdmin } from "@/lib/supabase/admin";
import { providers } from "@/lib/payments";
import { notifyOrderCreated } from "@/lib/notify";
import type { Discount, Order, OrderItem, ShippingMethod } from "@/lib/types";

export interface CheckoutInput {
  items: { slug: string; qty: number }[];
  email: string; name: string; phone?: string;
  address?: { street?: string; city?: string; zip?: string; country?: string };
  shippingMethod: string; pickupPoint?: Record<string, unknown> | null;
  paymentMethod: string; discountCode?: string; notes?: string; locale?: "cs" | "en";
}

export function discountFor(d: Discount | null, subtotal: number, shipping: number) {
  if (!d || !d.active) return { amount: 0, freeShipping: false };
  const now = Date.now();
  if (d.starts_at && new Date(d.starts_at).getTime() > now) return { amount: 0, freeShipping: false };
  if (d.ends_at && new Date(d.ends_at).getTime() < now) return { amount: 0, freeShipping: false };
  if (d.usage_limit && d.used >= d.usage_limit) return { amount: 0, freeShipping: false };
  if (d.min_total && subtotal < d.min_total) return { amount: 0, freeShipping: false };
  if (d.type === "percent") return { amount: Math.round(subtotal * d.value) / 100, freeShipping: false };
  if (d.type === "fixed") return { amount: Math.min(d.value, subtotal), freeShipping: false };
  return { amount: shipping, freeShipping: true };
}

export async function createOrder(input: CheckoutInput, siteUrl: string) {
  const db = supabaseAdmin();
  const slugs = input.items.map((i) => i.slug);
  const { data: products } = await db.from("products").select("slug,name,brand,price,images,stock,category").in("slug", slugs).eq("status", "active");
  if (!products?.length) throw new Error("No purchasable items");
  const items: OrderItem[] = input.items.flatMap((i) => {
    const p = products.find((x) => x.slug === i.slug);
    return p ? [{ slug: p.slug, name: p.name, brand: p.brand, price: Number(p.price), qty: Math.max(1, i.qty), image: (p.images as { url: string }[])?.[0]?.url }] : [];
  });
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  const { data: ship } = await db.from("shipping_methods").select("*").eq("id", input.shippingMethod).eq("enabled", true).maybeSingle();
  if (!ship) throw new Error("Shipping method unavailable");
  const sm = ship as ShippingMethod;
  const hasVehicle = products.some((p) => p.category !== "prislusenstvi");
  if (hasVehicle && !sm.vehicles) throw new Error("Vehicles need dealer delivery or pickup");
  let shipping = sm.free_over != null && subtotal >= sm.free_over ? 0 : Number(sm.price);

  let discount: Discount | null = null;
  if (input.discountCode) {
    const { data } = await db.from("discounts").select("*").ilike("code", input.discountCode).maybeSingle();
    discount = data as Discount | null;
  }
  const { amount: discountAmount, freeShipping } = discountFor(discount, subtotal, shipping);
  if (freeShipping) shipping = 0;
  const total = Math.max(0, subtotal + shipping - (freeShipping ? 0 : discountAmount));

  const { data: pay } = await db.from("payment_methods").select("*").eq("id", input.paymentMethod).eq("enabled", true).maybeSingle();
  if (!pay) throw new Error("Payment method unavailable");
  const provider = providers[input.paymentMethod];
  if (!provider?.configured) throw new Error(`Payment provider ${input.paymentMethod} is not configured`);

  const { data: order, error } = await db.from("orders").insert({
    customer_email: input.email, customer_name: input.name, phone: input.phone ?? null,
    shipping_address: input.address ?? null, items, subtotal, shipping_cost: shipping,
    discount_code: discount && discountAmount > 0 ? discount.code : null, discount_amount: freeShipping ? 0 : discountAmount, total,
    payment_provider: input.paymentMethod, shipping_method: sm.id, shipping_carrier: sm.carrier,
    pickup_point: input.pickupPoint ?? null, notes: input.notes ?? null, locale: input.locale ?? "cs",
    timeline: [{ at: new Date().toISOString(), text: "Objednávka vytvořena" }],
  }).select("*").single();
  if (error || !order) throw new Error(error?.message ?? "Order insert failed");
  const o = order as Order;

  await db.from("customers").upsert({ email: input.email, name: input.name, phone: input.phone ?? null, address: input.address ?? null }, { onConflict: "email" });
  if (discount && discountAmount > 0) await db.from("discounts").update({ used: discount.used + 1 }).eq("id", discount.id);

  const result = await provider.createPayment(o, {
    returnUrl: `${siteUrl}/objednavka/${o.id}/?paid=1`,
    cancelUrl: `${siteUrl}/objednavka/${o.id}/?cancelled=1`,
    notifyUrl: `${siteUrl}/api/webhooks/${input.paymentMethod}`,
  });
  await db.from("orders").update({ payment_ref: result.ref ?? null, payment_status: result.status === "paid" ? "paid" : result.redirectUrl ? "pending" : "unpaid" }).eq("id", o.id);

  const { data: notif } = await db.from("settings").select("value").eq("key", "notifications").maybeSingle();
  await notifyOrderCreated(o, (notif?.value as { orderEmailTo?: string })?.orderEmailTo);
  return { orderId: o.id, number: o.number, redirectUrl: result.redirectUrl ?? null };
}

export async function applyPaymentUpdate(orderId: string, status: "paid" | "failed" | "pending" | "refunded", ref?: string) {
  const db = supabaseAdmin();
  const { data: cur } = await db.from("orders").select("timeline,status").eq("id", orderId).maybeSingle();
  if (!cur) return;
  const timeline = [...(cur.timeline as { at: string; text: string }[]), { at: new Date().toISOString(), text: `Platba: ${status}` }];
  const orderStatus = status === "paid" ? (cur.status === "pending" ? "paid" : cur.status) : status === "refunded" ? "refunded" : cur.status;
  await db.from("orders").update({ payment_status: status, payment_ref: ref ?? undefined, status: orderStatus, timeline }).eq("id", orderId);
}
