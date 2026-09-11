import { AdminShell } from "@/components/admin/Shell";
/* Admin pages render at request time so they always see the runtime environment. */
export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Moto Dvořák", robots: { index: false } };
export default function Layout({ children }: { children: React.ReactNode }) { return <AdminShell>{children}</AdminShell>; }
