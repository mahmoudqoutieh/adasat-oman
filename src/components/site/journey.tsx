import { lazy, Suspense, useEffect, useRef, useState } from "react";

import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

// The scroll-scrub engine seeks video on every scroll frame. That is great on a
// desktop with a mouse and too heavy for phones, so phones get a lightweight
// autoplay loop instead and the engine is only downloaded on desktop.
const ScrollScrub = lazy(() =>
  import("@/components/scroll-scrub/scroll-scrub").then((m) => ({ default: m.ScrollScrub })),
);

const DESKTOP_QUERY = "(min-width: 861px) and (hover: hover) and (pointer: fine)";

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

function MobileHero() {
  const ref = useRef<HTMLVideoElement>(null);
  const scene = scenes[0];

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Desktop swaps this hero out right after mount; never start its download there.
    if (window.matchMedia(DESKTOP_QUERY).matches) return;

    video.muted = true;
    video.src = "/assets/world/hero-mobile.mp4";
    const play = () => void video.play().catch(() => undefined);
    play();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else video.pause();
      },
      { threshold: 0.05 },
    );
    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  return (
    <section aria-labelledby="mhero-title" className="mhero">
      <video
        aria-hidden="true"
        className="mhero__video"
        disablePictureInPicture
        loop
        muted
        playsInline
        poster="/assets/world/hero-mobile-poster.jpg"
        preload="auto"
        ref={ref}
        tabIndex={-1}
      />
      <div aria-hidden="true" className="mhero__shade" />
      <div className="mhero__copy">
        <p className="mhero__kicker">{scene.kicker}</p>
        <h1 id="mhero-title">{scene.title}</h1>
        <p className="mhero__body">{scene.body}</p>
        <ul className="mhero__tags">
          {scene.tags?.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <a className="cta-arrow" href="#collection">
          <span>تصفّح المجموعة</span>
          <i aria-hidden="true">←</i>
        </a>
      </div>
    </section>
  );
}

const STORY = [
  { image: "/assets/world/story-frames.jpg", scene: scenes[1] },
  { image: "/assets/world/story-lenses.jpg", scene: scenes[2] },
];

function MobileStory() {
  return (
    <section aria-label="لماذا عدسات عمان" className="mstory">
      <div className="mstory__track">
        {STORY.map(({ image, scene }) => (
          <article className="mstory__card" key={scene.id}>
            <img alt="" decoding="async" height={960} loading="lazy" src={image} width={540} />
            <div className="mstory__text">
              <p>{scene.kicker}</p>
              <h2>{scene.title}</h2>
              <span>{scene.body}</span>
            </div>
          </article>
        ))}
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
      <div className="only-mobile">
        {desktop ? null : (
          <>
            <MobileHero />
            <MobileStory />
          </>
        )}
      </div>
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
