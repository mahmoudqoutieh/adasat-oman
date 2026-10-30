import { EMPTY_SETTINGS, type Product, type SiteSettings } from "./site-config";

export type SiteData = {
  products: Product[];
  settings: SiteSettings;
  adminReady: boolean;
};

/** Reads products + contact settings from the PHP API. Returns null when it is unreachable. */
export async function fetchSiteData(): Promise<SiteData | null> {
  try {
    const res = await fetch("/api/products.php", { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.products)) return null;
    return {
      products: data.products as Product[],
      settings: { ...EMPTY_SETTINGS, ...(data.settings ?? {}) },
      adminReady: Boolean(data.adminReady),
    };
  } catch {
    return null;
  }
}
