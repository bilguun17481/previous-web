import { notFound } from "next/navigation";
import { supabaseConfigured } from "@/lib/supabase/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { OrderView } from "@/components/views/OrderView";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!supabaseConfigured) notFound();
  const { data } = await supabaseAdmin().from("orders").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <OrderView order={data as Order} paid={sp.paid === "1"} cancelled={sp.cancelled === "1"} />;
}
