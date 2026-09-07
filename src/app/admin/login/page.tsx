"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { useT, Input, Field, Button } from "@/components/admin/ui";
import { supabaseConfigured } from "@/lib/supabase/env";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

function Login() {
  const { t } = useT();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/admin/";
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  // Arriving from a confirmation link (or already signed in): go straight to the admin.
  useEffect(() => {
    if (!supabaseConfigured) return;
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }: { data: { session: Session | null } }) => { if (data.session) { router.replace(next); router.refresh(); } });
    const { data: sub } = sb.auth.onAuthStateChange((_e: string, session: Session | null) => { if (session) { router.replace(next); router.refresh(); } });
    return () => sub.subscription.unsubscribe();
  }, [next, router]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    const sb = supabaseBrowser();
    const r = mode === "in" ? await sb.auth.signInWithPassword({ email, password }) : await sb.auth.signUp({ email, password });
    setBusy(false);
    if (r.error) return setMsg(r.error.message);
    if (mode === "up" && !r.data.session) return setMsg(t(adm.login.checkEmail));
    router.push(next); router.refresh();
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f6f4] px-4">
      <div className="w-full max-w-sm rounded-lg border border-hair bg-paper p-8">
        <div className="text-[15px] font-extrabold uppercase tracking-[-0.03em]">Moto Dvořák</div>
        <h1 className="mt-4 text-[20px] font-semibold">{t(adm.login.title)}</h1>
        {supabaseConfigured ? (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label={t(adm.login.email)}><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label={t(adm.login.password)}><Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
            {mode === "up" && <p className="text-[12px] text-mute">{t(adm.login.first)}</p>}
            {msg && <p className="text-[12px] text-signal">{msg}</p>}
            <Button className="w-full" disabled={busy}>{mode === "in" ? t(adm.login.signIn) : t(adm.login.signUp)}</Button>
            <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="block w-full text-center text-[12px] text-mute underline underline-offset-4">{mode === "in" ? t(adm.login.toggleUp) : t(adm.login.toggleIn)}</button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-[13px] text-mute">{t(adm.login.demo)}</p>
            <Button className="w-full" onClick={() => router.push("/admin/")}>{t(adm.login.enter)}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
export default function Page() { return <Suspense><Login /></Suspense>; }
