export type Category = "medical" | "sun";

export type Product = {
  id: number;
  name: string;
  category: Category;
  price: number;
  description: string;
  image: string;
};

export type SiteSettings = {
  whatsapp: string;
  instagram: string;
  address: string;
  hours: string;
};

export const BRAND = {
  name: "عدسات عمان",
  latin: "Adasat Oman",
  tagline: "نظارات ترى بها العالم بوضوح",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  medical: "نظارة طبية",
  sun: "نظارة شمسية",
};

// Edit this list to match the brands the shop really carries.
export const BRANDS = [
  "Ray-Ban",
  "Oakley",
  "Persol",
  "Tom Ford",
  "Carrera",
  "Police",
  "Silhouette",
  "Essilor",
  "Zeiss",
  "Hoya",
];

export const EMPTY_SETTINGS: SiteSettings = {
  whatsapp: "",
  instagram: "",
  address: "",
  hours: "",
};

export const SEED_PRODUCTS: Product[] = [
  { id: 1, name: "إطار ذهبي دائري", category: "medical", price: 38, description: "سلك معدني رفيع بتصميم كلاسيكي خفيف", image: "/assets/products/gold-round.webp" },
  { id: 2, name: "كات آي بنقشة السلحفاة", category: "medical", price: 42, description: "أسيتات فاخر بنقشة دافئة وإطلالة أنيقة", image: "/assets/products/tortoise-cateye.webp" },
  { id: 3, name: "مستطيل أسود مطفي", category: "medical", price: 35, description: "خطوط حادة وثبات يومي للعمل والدراسة", image: "/assets/products/matte-black.webp" },
  { id: 4, name: "أفياتور فضي بمرايا زرقاء", category: "sun", price: 29, description: "عدسات متدرجة تحمي من وهج الشمس", image: "/assets/products/aviator-blue.webp" },
  { id: 5, name: "كريستال رمادي شفاف", category: "medical", price: 45, description: "أسيتات شفاف بلمسة دخانية عصرية", image: "/assets/products/crystal-smoke.webp" },
  { id: 6, name: "مربع روز جولد", category: "sun", price: 33, description: "إطار كبير بعدسات بنية متدرجة", image: "/assets/products/rose-square.webp" },
];

export function formatPrice(price: number): string {
  const value = Number.isInteger(price) ? String(price) : price.toFixed(3);
  return `${value} ر.ع`;
}

export function waLink(settings: SiteSettings, text: string): string {
  const number = settings.whatsapp.replace(/\D/g, "");
  if (!number) return "#visit";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
