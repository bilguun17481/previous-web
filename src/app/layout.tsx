import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Moto Dvořák · Čtyřkolky, UTV, motocykly a skútry",
  description: "Prodej a servis čtyřkolek CFMOTO, Linhai, TGB, skútrů Kentoya a TUMOTO a motocyklů CFMOTO. Golčův Jeníkov.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <LangProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
