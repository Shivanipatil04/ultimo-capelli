"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import before1 from "@/assets/before-1.jpeg";
import after1 from "@/assets/after-1.jpeg";
import before2 from "@/assets/before-2.jpeg";
import after2 from "@/assets/after-2.jpeg";
import before3 from "@/assets/before-3.jpeg";
import after3 from "@/assets/after-3.jpeg";
import before4 from "@/assets/before-4.jpeg";
import after4 from "@/assets/after-4.jpeg";

/*
 * Actual image dimensions:
 *   before-1: 1200×1600 (3:4)    after-1: 1200×1600 (3:4)
 *   before-2:  340× 396 (~6:7)   after-2:  330× 360 (~11:12)
 *   before-3:  333× 392 (~6:7)   after-3:  336× 383 (~7:8)
 *   before-4:  328× 356 (~11:12) after-4:  332× 367 (~9:10)
 *
 * All portrait. We render them at natural aspect ratio using
 * Next.js Image (width/height props) so the full photo is always visible.
 */

interface TransformationPair {
  id: string;
  beforeImg: any;
  afterImg: any;
}

const defaultTransformations: TransformationPair[] = [
  { id: "pair-1", beforeImg: before1, afterImg: after1 },
  { id: "pair-2", beforeImg: before2, afterImg: after2 },
  { id: "pair-3", beforeImg: before3, afterImg: after3 },
  { id: "pair-4", beforeImg: before4, afterImg: after4 },
];

/**
 * Scroll-driven Transformation Stack.
 * Image-focused before/after showcase. No card chrome — photographs are the hero.
 */
export default function BeforeAfterHead() {
  const [transformations, setTransformations] = useState<TransformationPair[]>(defaultTransformations);
  const sectionRef = useRef<HTMLDivElement>(null);
  const pairRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    fetch('/api/transformations')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (data && data.length > 0) {
          const fetched = data.filter((t: any) => t.isActive).map((t: any) => ({
            id: t._id,
            beforeImg: t.beforeImage,
            afterImg: t.afterImage,
          }));
          setTransformations(fetched.length > 0 ? fetched : defaultTransformations);
          setTimeout(() => ScrollTrigger.refresh(), 100);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const pairs = pairRefs.current.filter(Boolean) as HTMLDivElement[];
      if (pairs.length === 0 || !sectionRef.current) return;

      const isMobile = window.innerWidth < 768;
      const enterY = isMobile ? 40 : 60;
      const exitY = isMobile ? -40 : -50;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setActiveIndex(Math.min(pairs.length - 1, Math.floor(self.progress * pairs.length)));
          },
        },
      });

      // Initialize all pairs off-screen
      gsap.set(pairs[0], { y: enterY, scale: 0.95, autoAlpha: 0, zIndex: 10 });
      for (let i = 1; i < pairs.length; i++) {
        gsap.set(pairs[i], { y: enterY + 10, scale: 0.92, autoAlpha: 0, zIndex: 10 + i * 10 });
      }

      // Pair 1 enters
      tl.to(pairs[0], { y: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: "power2.out" });
      tl.to({}, { duration: 0.7 });

      // Transitions
      for (let i = 0; i < pairs.length - 1; i++) {
        tl.to(pairs[i], { y: exitY, scale: 0.96, autoAlpha: 0, duration: 0.8, ease: "power2.inOut" });
        tl.to(pairs[i + 1], { y: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: "power2.out" }, "<0.15");
        tl.to({}, { duration: 0.7 });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isReducedMotion, transformations]);

  // ── Reduced-motion fallback ──
  if (isReducedMotion) {
    return (
      <div className="py-12 md:py-20 bg-background px-5 md:px-16 max-w-container-max mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface mb-2">
            The Transformation
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto">
            See the difference a natural-looking transformation can make.
          </p>
        </div>
        <div className="space-y-10 max-w-4xl mx-auto">
          {transformations.map((pair) => (
            <div key={pair.id} className="grid grid-cols-2 gap-4 md:gap-8 items-start">
              <div className="text-center">
                <span className="text-[11px] font-semibold text-on-surface-variant/60 uppercase tracking-[0.15em] mb-2 inline-block">Before</span>
                <div className="rounded-xl overflow-hidden">
                  <Image src={pair.beforeImg} alt="Before" width={600} height={800} className="w-full h-auto" sizes="(max-width: 768px) 45vw, 400px" />
                </div>
              </div>
              <div className="text-center">
                <span className="text-[11px] font-semibold text-primary/70 uppercase tracking-[0.15em] mb-2 inline-block">After</span>
                <div className="rounded-xl overflow-hidden">
                  <Image src={pair.afterImg} alt="After" width={600} height={800} className="w-full h-auto" sizes="(max-width: 768px) 45vw, 400px" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Main scroll-driven render ──
  return (
    <div
      ref={sectionRef}
      className="min-h-screen min-h-[100svh] flex flex-col items-center justify-center bg-background relative overflow-hidden"
    >
      {/* Background glow — preserved for parallax layer in page.tsx */}
      <div className="transform-layer-bg absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[750px] h-[600px] md:h-[750px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Heading */}
      <div className="text-center mb-4 md:mb-6 relative z-20 px-4">
        <h2 className="font-display-lg text-2xl sm:text-3xl md:text-display-lg text-on-surface mb-1">
          The Transformation
        </h2>
        <p className="font-body-md text-sm md:text-base text-on-surface-variant max-w-md mx-auto">
          See the difference a natural-looking transformation can make.
        </p>
      </div>

      {/* ── Image Stage ── */}
      <div className="relative w-full z-10 flex items-center justify-center px-4 md:px-8" style={{ height: "clamp(400px, 62svh, 560px)" }}>
        {transformations.map((pair, idx) => (
          <div
            key={pair.id}
            ref={(el) => { pairRefs.current[idx] = el; }}
            className="absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 lg:gap-10 select-none px-4 md:px-0"
            style={{ transformOrigin: "center center", willChange: "transform, opacity" }}
          >
            {/* ── Desktop side-by-side labels ── */}
            <div className="hidden md:contents">
              {/* BEFORE column */}
              <div className="flex flex-col items-center max-w-[380px] lg:max-w-[420px] xl:max-w-[460px]">
                <span className="text-xs font-semibold text-on-surface-variant/50 uppercase tracking-[0.15em] mb-2">
                  Before
                </span>
                <div className="rounded-xl overflow-hidden">
                  <Image width={600} height={800}
                    src={pair.beforeImg}
                    alt="Before treatment"
                    className="w-full h-auto"
                    sizes="420px"
                    priority={idx === 0}
                    style={{ maxHeight: "clamp(340px, 55svh, 500px)" }}
                  />
                </div>
              </div>

              {/* AFTER column */}
              <div className="flex flex-col items-center max-w-[380px] lg:max-w-[420px] xl:max-w-[460px]">
                <span className="text-xs font-semibold text-primary/60 uppercase tracking-[0.15em] mb-2">
                  After
                </span>
                <div className="rounded-xl overflow-hidden">
                  <Image width={600} height={800}
                    src={pair.afterImg}
                    alt="After restoration"
                    className="w-full h-auto"
                    sizes="420px"
                    priority={idx === 0}
                    style={{ maxHeight: "clamp(340px, 55svh, 500px)" }}
                  />
                </div>
              </div>
            </div>

            {/* ── Mobile vertical stack ── */}
            <div className="contents md:hidden">
              {/* BEFORE */}
              <div className="flex flex-col items-center w-full">
                <span className="text-[11px] font-semibold text-on-surface-variant/50 uppercase tracking-[0.15em] mb-1">
                  Before
                </span>
                <div className="rounded-xl overflow-hidden max-w-[320px] sm:max-w-[360px]">
                  <Image width={600} height={800}
                    src={pair.beforeImg}
                    alt="Before treatment"
                    className="w-full h-auto"
                    sizes="85vw"
                    priority={idx === 0}
                    style={{ maxHeight: "clamp(160px, 26svh, 280px)" }}
                  />
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center text-primary/30 -my-0.5">
                <span className="material-symbols-outlined text-sm">arrow_downward</span>
              </div>

              {/* AFTER */}
              <div className="flex flex-col items-center w-full">
                <span className="text-[11px] font-semibold text-primary/60 uppercase tracking-[0.15em] mb-1">
                  After
                </span>
                <div className="rounded-xl overflow-hidden max-w-[320px] sm:max-w-[360px]">
                  <Image width={600} height={800}
                    src={pair.afterImg}
                    alt="After restoration"
                    className="w-full h-auto"
                    sizes="85vw"
                    priority={idx === 0}
                    style={{ maxHeight: "clamp(160px, 26svh, 280px)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Progress indicator ── */}
      <div className="mt-3 md:mt-5 flex items-center gap-2 relative z-20">
        <span className="text-xs font-semibold text-primary tracking-widest">
          0{activeIndex + 1}
        </span>
        <span className="text-on-surface-variant/30 text-xs">/</span>
        <span className="text-xs text-on-surface-variant/50 tracking-widest">04</span>
        <div className="flex items-center gap-1.5 ml-1">
          {transformations.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === activeIndex ? "w-4 bg-primary" : "w-1 bg-outline-variant/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
