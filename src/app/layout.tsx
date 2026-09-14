import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { SettingsProvider, type SiteSettings } from "@/lib/settings";
import { getSetting } from "@/lib/data";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { publicEnv } from "@/lib/env";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Moto Dvořák · Čtyřkolky, UTV, motocykly a skútry",
  description: "Prodej a servis čtyřkolek CFMOTO, Linhai, TGB, skútrů Kentoya a TUMOTO a motocyklů CFMOTO. Golčův Jeníkov.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Render every page on request (except in the static GitHub Pages mirror): the host's live
  // environment is read at request time and admin edits show on the storefront immediately.
  if (process.env.STATIC_EXPORT !== "1") await connection();
  const [store, announcement, theme] = await Promise.all([
    getSetting<SiteSettings["store"]>("store"), getSetting<SiteSettings["announcement"]>("announcement"), getSetting<SiteSettings["theme"]>("theme"),
  ]);
  const settings: SiteSettings = { store, announcement, theme };
  const vars = [theme?.accent && `--color-ink:${theme.accent}`, theme?.signal && `--color-signal:${theme.signal}`, theme?.font && theme.font !== "Inter" && `--font-sans:"${theme.font}",Inter Variable,sans-serif`].filter(Boolean).join(";");
  // Public runtime settings for the browser, so the client works even when build-time variables were absent.
  const runtimeEnv = JSON.stringify({ url: publicEnv("NEXT_PUBLIC_SUPABASE_URL"), anonKey: publicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), siteUrl: publicEnv("NEXT_PUBLIC_SITE_URL") });
  return (
    <html lang="cs">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `window.__ENV__=${runtimeEnv}` }} />
        {vars ? <style>{`:root{${vars}}`}</style> : null}
      </head>
      <body>
        <LangProvider>
          <SettingsProvider value={settings}>
            <CartProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            </CartProvider>
          </SettingsProvider>
        </LangProvider>
      </body>
    </html>
  );
}
