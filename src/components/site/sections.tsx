import { BRAND, waLink, type SiteSettings } from "@/site-config";
import { LogoMark } from "./site-header";

const SERVICES = [
  {
    title: "فحص النظر",
    text: "قياس دقيق لحدة الإبصار بأجهزة حديثة، ونصيحة واضحة بما يناسب عينيك.",
  },
  {
    title: "عدسات مفصّلة على مقاسك",
    text: "عدسات طبية بطبقات مضادة للانعكاس والأشعة الزرقاء، تُركّب بعناية.",
  },
  {
    title: "إطارات لكل وجه",
    text: "نساعدك على اختيار الشكل واللون والمقاس الذي يناسب ملامحك وأسلوبك.",
  },
  {
    title: "صيانة وتعديل",
    text: "ضبط وتنظيف وتغيير أنف وتعديل مقاس، لتبقى نظارتك مريحة كل يوم.",
  },
];

export function Services() {
  return (
    <section className="svc" id="services">
      <div className="svc__lead">
        <h2>خدمة تبدأ بفحص نظرك وتنتهي براحتك</h2>
        <p>كل ما تحتاجه لنظارة مريحة في مكان واحد.</p>
      </div>
      <ul className="svc__list">
        {SERVICES.map((s) => (
          <li key={s.title}>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Visit({ settings }: { settings: SiteSettings }) {
  const rows: { label: string; value: string; href?: string }[] = [];
  if (settings.address) rows.push({ label: "العنوان", value: settings.address });
  if (settings.hours) rows.push({ label: "ساعات العمل", value: settings.hours });
  if (settings.whatsapp) {
    rows.push({
      label: "واتساب",
      value: `+${settings.whatsapp}`,
      href: waLink(settings, "مرحباً عدسات عمان"),
    });
  }
  if (settings.instagram) {
    rows.push({
      label: "انستغرام",
      value: `@${settings.instagram}`,
      href: `https://instagram.com/${settings.instagram}`,
    });
  }

  return (
    <section className="visit" id="visit">
      <h2>زورونا أو راسلونا</h2>
      <p className="visit__sub">
        نسعد بخدمتك في المحل، أو اطلب نظارتك مباشرة عبر واتساب.
      </p>
      {rows.length ? (
        <dl className="visit__rows">
          {rows.map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>
                {r.href ? (
                  <a href={r.href} rel="noopener" target="_blank">
                    {r.value}
                  </a>
                ) : (
                  r.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      <a
        className="visit-cta"
        href={waLink(settings, "مرحباً عدسات عمان، أرغب في الاستفسار")}
        rel="noopener"
        target={settings.whatsapp ? "_blank" : undefined}
      >
        <span>تحدّث معنا الآن</span>
        <i aria-hidden="true">←</i>
      </a>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="brand">
        <LogoMark size={28} />
        <span>{BRAND.name}</span>
      </div>
      <p>© 2026 {BRAND.name}. جميع الحقوق محفوظة.</p>
    </footer>
  );
}
