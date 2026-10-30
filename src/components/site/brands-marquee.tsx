import { BRANDS } from "@/site-config";

export function BrandsMarquee() {
  const row = [...BRANDS, ...BRANDS];
  return (
    <section aria-label="العلامات التجارية" className="brands">
      <div className="brands__track">
        {row.map((name, i) => (
          <span
            aria-hidden={i >= BRANDS.length ? "true" : undefined}
            className={i % 2 ? "brands__item brands__item--line" : "brands__item"}
            key={`${name}-${i}`}
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
