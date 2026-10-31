import { lazy, Suspense, useEffect, useRef, useState } from "react";

import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

// Desktop: the scroll-scrub engine seeks a video as you scroll (loaded lazily).
// Phones: a light canvas + pre-rendered image frames, so the film and the text
// move together with the finger without any video seeking.
const ScrollScrub = lazy(() =>
  import("@/components/scroll-scrub/scroll-scrub").then((m) => ({ default: m.ScrollScrub })),
);

const DESKTOP_QUERY = "(min-width: 861px) and (hover: hover) and (pointer: fine)";

const FRAME_COUNT = 80;
const FRAME_W = 720;
const FRAME_H = 1280;
const frameUrl = (i: number) => `/assets/world/m/f${String(i + 1).padStart(3, "0")}.webp`;

const actions: Record<string, React.ReactNode> = {
  vision: (
    <>
      <a className="cta-arrow" href="#collection">
        <span>تصفّح المجموعة</span>
        <i aria-hidden="true">←</i>
      </a>
      <a className="link-draw" href="#visit">
        زورونا
      </a>
    </>
  ),
  lenses: (
    <a className="cta-arrow" href="#collection">
      <span>شاهد النظارات</span>
      <i aria-hidden="true">←</i>
    </a>
  ),
};

// Module constant: a new identity per render would rebuild the controller.
const scenes = scrollScrubScenes.map((scene) => ({
  ...scene,
  actions: actions[scene.id],
}));

function DesktopPlaceholder() {
  return (
    <section
      aria-hidden="true"
      className="dhero-ph"
      style={{ backgroundImage: `url(${scenes[0].poster})` }}
    />
  );
}

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** 0 → 1 over [a, b], stays 1 until [c, d], then 1 → 0 (a trapezoid). */
function window4(p: number, a: number, b: number, c: number, d: number) {
  if (p < b) return clamp((p - a) / (b - a));
  if (p > c) return clamp(1 - (p - c) / (d - c));
  return 1;
}

// Where each chapter fades in and out along the scroll (0 to 1).
const WINDOWS: [number, number, number, number][] = [
  [-1, -0.5, 0.2, 0.3],
  [0.3, 0.38, 0.55, 0.65],
  [0.65, 0.73, 2, 3],
];

function MobileJourney() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia(DESKTOP_QUERY).matches) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const images: (HTMLImageElement | undefined)[] = new Array(FRAME_COUNT);
    let destroyed = false;
    let current = 0;
    let target = 0;
    let drawn = -1;
    let raf = 0;
    let dirty = true;
    const startedAt = performance.now();

    // Coarse-to-fine order: every 8th frame first, then 4th, 2nd, the rest.
    const order: number[] = [];
    const seen = new Set<number>();
    for (const step of [8, 4, 2, 1]) {
      for (let i = 0; i < FRAME_COUNT; i += step) {
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      }
    }

    const loadFrame = (i: number) =>
      new Promise<void>((resolve) => {
        if (destroyed || images[i]) return resolve();
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          images[i] = img;
          dirty = true;
          schedule();
          resolve();
        };
        img.onerror = () => resolve();
        img.src = frameUrl(i);
      });

    const pump = async () => {
      let next = 0;
      const worker = async () => {
        while (!destroyed && next < order.length) await loadFrame(order[next++]);
      };
      await Promise.all([worker(), worker(), worker()]);
    };

    const nearest = (idx: number) => {
      for (let d = 0; d < FRAME_COUNT; d++) {
        const lo = images[idx - d];
        if (lo) return idx - d;
        const hi = images[idx + d];
        if (hi) return idx + d;
      }
      return -1;
    };

    const draw = () => {
      const idx = nearest(clamp(Math.round(current), 0, FRAME_COUNT - 1));
      if (idx < 0 || idx === drawn) return;
      const img = images[idx];
      if (!img) return;
      ctx.drawImage(img, 0, 0, FRAME_W, FRAME_H);
      drawn = idx;
    };

    const layoutChapters = (p: number) => {
      chapterRefs.current.forEach((el, i) => {
        if (!el) return;
        const [a, b, c, d] = WINDOWS[i];
        const v = window4(p, a, b, c, d);
        const rising = p < (b + c) / 2;
        const shift = (1 - v) * (rising ? 28 : -28);
        el.style.opacity = String(v);
        el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
        el.style.visibility = v < 0.02 ? "hidden" : "visible";
      });
    };

    const read = () => {
      const rect = root.getBoundingClientRect();
      const range = Math.max(root.offsetHeight - window.innerHeight, 1);
      const p = clamp(-rect.top / range);
      const idle = window.scrollY < 8 ? 5 * (0.5 - 0.5 * Math.cos((performance.now() - startedAt) / 1300)) : 0;
      target = p * (FRAME_COUNT - 1) + idle;
      layoutChapters(p);
    };

    const tick = () => {
      raf = 0;
      if (destroyed) return;
      read();
      current += (target - current) * 0.28;
      if (Math.abs(target - current) < 0.02) current = target;
      draw();
      const atTop = window.scrollY < 8;
      if (dirty || Math.abs(target - current) > 0.02 || atTop) {
        dirty = false;
        raf = requestAnimationFrame(tick);
      }
    };

    function schedule() {
      if (!raf && !destroyed) raf = requestAnimationFrame(tick);
    }

    const onScroll = () => {
      dirty = true;
      schedule();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    void pump();
    schedule();

    return () => {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const [first, second, third] = scenes;
  return (
    <section aria-label="عدسات عمان" className="mj" ref={rootRef}>
      <div className="mj__stage">
        <canvas
          aria-hidden="true"
          className="mj__canvas"
          height={FRAME_H}
          ref={canvasRef}
          style={{ backgroundImage: `url(${frameUrl(0)})` }}
          width={FRAME_W}
        />
        <span aria-hidden="true" className="mj__shade" />

        <div className="mj__chapter" ref={(el) => { chapterRefs.current[0] = el; }}>
          <p className="mj__kicker">{first.kicker}</p>
          <h1>{first.title}</h1>
          <p className="mj__body">{first.body}</p>
          <ul className="mj__tags">
            {first.tags?.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <a className="cta-arrow" href="#collection">
            <span>تصفّح المجموعة</span>
            <i aria-hidden="true">←</i>
          </a>
        </div>

        <div className="mj__chapter" ref={(el) => { chapterRefs.current[1] = el; }}>
          <p className="mj__kicker">{second.kicker}</p>
          <h2>{second.title}</h2>
          <p className="mj__body">{second.body}</p>
          <ul className="mj__tags">
            {second.tags?.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>

        <div className="mj__chapter" ref={(el) => { chapterRefs.current[2] = el; }}>
          <p className="mj__kicker">{third.kicker}</p>
          <h2>{third.title}</h2>
          <p className="mj__body">{third.body}</p>
          <ul className="mj__tags">
            {third.tags?.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <a className="cta-arrow" href="#collection">
            <span>شاهد النظارات</span>
            <i aria-hidden="true">←</i>
          </a>
        </div>

        <span aria-hidden="true" className="mj__cue" />
      </div>
    </section>
  );
}

export function Journey() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <>
      <div className="only-mobile">{desktop ? null : <MobileJourney />}</div>
      <div className="only-desktop">
        {desktop ? (
          <Suspense fallback={<DesktopPlaceholder />}>
            <ScrollScrub scenes={scenes} theme={scrollScrubTheme} />
          </Suspense>
        ) : (
          <DesktopPlaceholder />
        )}
      </div>
    </>
  );
}
