import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

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

export function Journey() {
  return <ScrollScrub scenes={scenes} theme={scrollScrubTheme} />;
}
