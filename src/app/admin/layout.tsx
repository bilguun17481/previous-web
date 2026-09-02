import { AdminShell } from "@/components/admin/Shell";
export const metadata = { title: "Admin · Moto Dvořák", robots: { index: false } };
export default function Layout({ children }: { children: React.ReactNode }) { return <AdminShell>{children}</AdminShell>; }
