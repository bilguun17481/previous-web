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
  const params = useSearchParams();
  const next = params.get("next") || "/admin/";
  const [mode, setMode] = useState<"in" | "up" | "forgot" | "reset">(params.get("reset") ? "reset" : "in");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  // Arriving from a confirmation link (or already signed in): go straight to the admin.
  // Arriving from a password-reset link: stay here and show the new-password form.
  useEffect(() => {
    if (!supabaseConfigured) return;
    if (mode === "reset") return;
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }: { data: { session: Session | null } }) => { if (data.session) { router.replace(next); router.refresh(); } });
    const { data: sub } = sb.auth.onAuthStateChange((e: string, session: Session | null) => {
      if (e === "PASSWORD_RECOVERY") { setMode("reset"); return; }
      if (session) { router.replace(next); router.refresh(); }
    });
    return () => sub.subscription.unsubscribe();
  }, [next, router, mode]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    const sb = supabaseBrowser();
    if (mode === "forgot") {
      const r = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/login/?reset=1` });
      setBusy(false);
      return setMsg(r.error ? r.error.message : t(adm.login.resetSent));
    }
    if (mode === "reset") {
      const r = await sb.auth.updateUser({ password });
      setBusy(false);
      if (r.error) return setMsg(r.error.message);
      router.replace(next); router.refresh();
      return;
    }
    const r = mode === "in" ? await sb.auth.signInWithPassword({ email, password }) : await sb.auth.signUp({ email, password });
    setBusy(false);
    if (r.error) return setMsg(r.error.message);
    if (mode === "up" && !r.data.session) return setMsg(t(adm.login.checkEmail));
    router.push(next); router.refresh();
  };
  const title = mode === "forgot" ? t(adm.login.forgotTitle) : mode === "reset" ? t(adm.login.resetTitle) : t(adm.login.title);
  const cta = mode === "in" ? t(adm.login.signIn) : mode === "up" ? t(adm.login.signUp) : mode === "forgot" ? t(adm.login.sendReset) : t(adm.login.saveNew);
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f6f4] px-4">
      <div className="w-full max-w-sm rounded-lg border border-hair bg-paper p-8">
        <div className="text-[15px] font-extrabold uppercase tracking-[-0.03em]">Moto Dvořák</div>
        <h1 className="mt-4 text-[20px] font-semibold">{title}</h1>
        {supabaseConfigured ? (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode !== "reset" && <Field label={t(adm.login.email)}><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>}
            {mode !== "forgot" && <Field label={mode === "reset" ? t(adm.login.newPassword) : t(adm.login.password)}><Input type="password" required minLength={8} autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>}
            {mode === "up" && <p className="text-[12px] text-mute">{t(adm.login.first)}</p>}
            {mode === "forgot" && <p className="text-[12px] text-mute">{t(adm.login.forgotHint)}</p>}
            {msg && <p className="text-[12px] text-signal">{msg}</p>}
            <Button className="w-full" disabled={busy}>{cta}</Button>
            {mode === "in" && <button type="button" onClick={() => { setMode("forgot"); setMsg(null); }} className="block w-full text-center text-[12px] text-mute underline underline-offset-4">{t(adm.login.forgot)}</button>}
            {mode !== "reset" && <button type="button" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }} className="block w-full text-center text-[12px] text-mute underline underline-offset-4">{mode === "in" ? t(adm.login.toggleUp) : t(adm.login.toggleIn)}</button>}
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
