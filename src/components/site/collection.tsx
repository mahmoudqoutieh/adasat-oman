import { useMemo, useRef, useState } from "react";

import {
  CATEGORY_LABEL,
  formatPrice,
  waLink,
  type Category,
  type Product,
  type SiteSettings,
} from "@/site-config";

const FILTERS: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "medical", label: "طبية" },
  { id: "sun", label: "شمسية" },
];

function ProductCard({
  product,
  settings,
}: {
  product: Product;
  settings: SiteSettings;
}) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.setProperty("--ry", `${x * 10}deg`);
    ref.current.style.setProperty("--rx", `${-y * 8}deg`);
    ref.current.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    ref.current.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--ry", "0deg");
    ref.current?.style.setProperty("--rx", "0deg");
  };

  return (
    <article
      className="pcard"
      onPointerLeave={onLeave}
      onPointerMove={onMove}
      ref={ref}
    >
      <div className="pcard__media">
        <img
          alt={product.name}
          decoding="async"
          height={1125}
          loading="lazy"
          src={product.image}
          width={900}
        />
        <span aria-hidden="true" className="pcard__shine" />
      </div>
      <div className="pcard__body">
        <p className="pcard__cat">{CATEGORY_LABEL[product.category]}</p>
        <h3>{product.name}</h3>
        {product.description ? <p className="pcard__desc">{product.description}</p> : null}
        <div className="pcard__row">
          <strong>{formatPrice(product.price)}</strong>
          <a
            className="card-ask"
            href={waLink(settings, `مرحباً عدسات عمان، أرغب في طلب: ${product.name}`)}
            rel="noopener"
            target={settings.whatsapp ? "_blank" : undefined}
          >
            <span>اطلبها</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export function Collection({
  products,
  settings,
}: {
  products: Product[];
  settings: SiteSettings;
}) {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const visible = useMemo(
    () => (filter === "all" ? products : products.filter((p) => p.category === filter)),
    [filter, products],
  );

  return (
    <section className="coll" id="collection">
      <div className="coll__head">
        <h2>مجموعتنا</h2>
        <div aria-label="تصفية المنتجات" className="chips" role="group">
          {FILTERS.map((f) => (
            <button
              aria-pressed={filter === f.id}
              key={f.id}
              onClick={() => setFilter(f.id)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? <p className="coll__empty">لا توجد منتجات في هذا القسم حالياً.</p> : null}
      <div className="coll__grid">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} settings={settings} />
        ))}
      </div>
    </section>
  );
}
