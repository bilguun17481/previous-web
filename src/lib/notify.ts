import type { Order } from "@/lib/types";
import { formatKc } from "@/data/catalog";
/* Transactional email through Resend (https://resend.com). Silently skipped when no key is set. */
const key = process.env.RESEND_API_KEY;
const from = process.env.NOTIFY_FROM ?? "Moto Dvořák <objednavky@motodvorak.cz>";

async function send(to: string, subject: string, html: string) {
  if (!key) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  }).catch(() => {});
}

const rows = (o: Order) => o.items.map((i) => `<tr><td style="padding:6px 0">${i.name} × ${i.qty}</td><td align="right">${formatKc(i.price * i.qty)}</td></tr>`).join("");

export async function notifyOrderCreated(o: Order, staffEmail?: string | null) {
  const cs = o.locale === "cs";
  const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:560px">
    <h2>${cs ? "Děkujeme za objednávku" : "Thank you for your order"} #${o.number}</h2>
    <table width="100%" style="border-collapse:collapse">${rows(o)}
    <tr><td style="padding-top:10px">${cs ? "Doprava" : "Shipping"}</td><td align="right">${formatKc(o.shipping_cost)}</td></tr>
    ${o.discount_amount ? `<tr><td>${cs ? "Sleva" : "Discount"}</td><td align="right">−${formatKc(o.discount_amount)}</td></tr>` : ""}
    <tr><td style="padding-top:10px;font-weight:bold">${cs ? "Celkem" : "Total"}</td><td align="right" style="font-weight:bold">${formatKc(o.total)}</td></tr></table>
    ${o.payment_provider === "bank_transfer" ? `<p>${cs ? "Platbu prosím zašlete převodem, variabilní symbol" : "Please pay by bank transfer, reference"} <b>${o.number}</b>.</p>` : ""}
    <p style="color:#666">Moto Dvořák · Nádraží 604, Golčův Jeníkov · +420 603 235 182</p></div>`;
  await send(o.customer_email, `${cs ? "Objednávka" : "Order"} #${o.number} · Moto Dvořák`, html);
  if (staffEmail) await send(staffEmail, `Nová objednávka #${o.number} · ${formatKc(o.total)}`, html);
}

export async function notifyOrderStatus(o: Order, text: string) {
  await send(o.customer_email, `${o.locale === "cs" ? "Objednávka" : "Order"} #${o.number}: ${text}`, `<p>${text}</p>${o.tracking_number ? `<p>Tracking: ${o.tracking_number}</p>` : ""}`);
}
