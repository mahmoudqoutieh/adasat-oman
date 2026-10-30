import { useEffect, useRef } from "react";

import { BRAND, waLink, type SiteSettings } from "@/site-config";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="logo-mark"
      height={size}
      viewBox="0 0 48 24"
      width={size * 2}
    >
      <circle cx="12" cy="13" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="36" cy="13" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M21 11.5c2-2 4-2 6 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="9" cy="10" r="2" className="logo-glint" />
    </svg>
  );
}

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      el.dataset.solid = window.scrollY > 24 ? "true" : "false";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className="hdr" data-solid="false" ref={ref}>
      <a className="brand" href="/" aria-label={BRAND.name}>
        <LogoMark />
        <span>{BRAND.name}</span>
      </a>
      <nav aria-label="التنقل الرئيسي">
        <a className="link-draw" href="#collection">
          المجموعة
        </a>
        <a className="link-draw" href="#services">
          خدماتنا
        </a>
        <a className="link-draw" href="#visit">
          زورونا
        </a>
      </nav>
      <a
        className="nav-wa"
        href={waLink(settings, "مرحباً عدسات عمان، أرغب في الاستفسار")}
        rel="noopener"
        target={settings.whatsapp ? "_blank" : undefined}
      >
        <b aria-hidden="true" />
        واتساب
      </a>
    </header>
  );
}

export function MobileBar({ settings }: { settings: SiteSettings }) {
  return (
    <div className="mbar">
      <a className="mbar__ghost" href="#collection">
        المجموعة
      </a>
      <a
        className="mbar__solid"
        href={waLink(settings, "مرحباً عدسات عمان، أرغب في الاستفسار")}
        rel="noopener"
        target={settings.whatsapp ? "_blank" : undefined}
      >
        تواصل واتساب
      </a>
    </div>
  );
}
