/**
 * Scene data for the Adasat Oman scroll journey: ONE continuous film cut into
 * three consecutive chapters (each clip starts on the frame after the previous
 * one ends), so the scrub is seamless.
 */
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";

export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#E0453A",
  background: "#0C1E2A",
  ink: "#EAF1F3",
  muted: "#A9BCC5",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    body: "أطر مختارة بعناية وعدسات دقيقة تناسب عينيك ونمط حياتك.",
    clip: "/assets/world/scene-01.mp4",
    id: "vision",
    kicker: "عدسات عمان",
    label: "الرؤية",
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobilePoster: "/assets/world/scene-01-mobile-poster.jpg",
    poster: "/assets/world/scene-01-poster.jpg",
    scroll: 1.5,
    tags: ["فحص النظر", "عدسات طبية", "نظارات شمسية"],
    title: "نظارات ترى بها العالم بوضوح",
  },
  {
    align: "right",
    body: "تيتانيوم خفيف وأسيتات فاخر وتفاصيل دقيقة تلاحظها من أول نظرة.",
    clip: "/assets/world/scene-02.mp4",
    id: "frames",
    kicker: "الإطارات",
    label: "الإطارات",
    mobileClip: "/assets/world/scene-02-mobile.mp4",
    mobilePoster: "/assets/world/scene-02-mobile-poster.jpg",
    poster: "/assets/world/scene-02-poster.jpg",
    scroll: 1.5,
    tags: ["تيتانيوم", "أسيتات", "ذهبي وفضي"],
    title: "إطارات صُمّمت لتدوم",
  },
  {
    body: "نقيس نظرك ونركّب عدسات مضادة للانعكاس وللأشعة الزرقاء بمقاسك.",
    clip: "/assets/world/scene-03.mp4",
    id: "lenses",
    kicker: "العدسات",
    label: "العدسات",
    mobileClip: "/assets/world/scene-03-mobile.mp4",
    mobilePoster: "/assets/world/scene-03-mobile-poster.jpg",
    poster: "/assets/world/scene-03-poster.jpg",
    scroll: 1.5,
    tags: ["مضادة للانعكاس", "حماية من الأشعة الزرقاء"],
    title: "عدسات بدقة المختبر",
  },
];
