import { useEffect, useState } from "react";

import { fetchSiteData } from "./api";
import { BrandsMarquee } from "./components/site/brands-marquee";
import { Collection } from "./components/site/collection";
import { Journey } from "./components/site/journey";
import { Services, SiteFooter, Visit } from "./components/site/sections";
import { MobileBar, SiteHeader } from "./components/site/site-header";
import {
  EMPTY_SETTINGS,
  SEED_PRODUCTS,
  type Product,
  type SiteSettings,
} from "./site-config";

export function App() {
  const [data, setData] = useState<{ products: Product[]; settings: SiteSettings }>({
    products: SEED_PRODUCTS,
    settings: EMPTY_SETTINGS,
  });

  useEffect(() => {
    let alive = true;
    void fetchSiteData().then((next) => {
      if (alive && next) setData({ products: next.products, settings: next.settings });
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <SiteHeader settings={data.settings} />
      <main>
        <Journey />
        <BrandsMarquee />
        <Collection products={data.products} settings={data.settings} />
        <Services />
        <Visit settings={data.settings} />
      </main>
      <SiteFooter />
      <MobileBar settings={data.settings} />
    </>
  );
}
