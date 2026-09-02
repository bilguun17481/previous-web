"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { StoreSettings, Text } from "@/lib/types";

export interface SiteSettings { store: Partial<StoreSettings> | null; announcement: { enabled: boolean; text: Text } | null; theme: { accent?: string; signal?: string; font?: string } | null }
const Ctx = createContext<SiteSettings>({ store: null, announcement: null, theme: null });
export const SettingsProvider = ({ value, children }: { value: SiteSettings; children: ReactNode }) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;
export const useSettings = () => useContext(Ctx);
