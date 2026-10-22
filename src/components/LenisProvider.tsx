"use client";

import { useEffect, useRef } from "react";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // Only initialize if user hasn't requested reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Use native momentum scrolling on touch / mobile devices to avoid main-thread scroll jank
    const isTouch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    if (isTouch) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    const initLenis = async () => {
      if (cancelled) return;
      try {
        const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

        if (cancelled) return;

        const lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.5,
        });
        lenisRef.current = lenis;

        // Sync GSAP ScrollTrigger with Lenis
        lenis.on("scroll", ScrollTrigger.update);
        const update = (time: number) => {
          lenis.raf(time * 1000);
        };

        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);

        cleanup = () => {
          gsap.ticker.remove(update);
          lenis.destroy();
          lenisRef.current = null;
        };
      } catch (err) {
        console.error("Failed to initialize Lenis:", err);
      }
    };

    const idleCallback = (window as any).requestIdleCallback;
    let timerId: any;
    if (typeof idleCallback === "function") {
      timerId = idleCallback(initLenis, { timeout: 1500 });
    } else {
      timerId = setTimeout(initLenis, 300);
    }

    return () => {
      cancelled = true;
      if (typeof (window as any).cancelIdleCallback === "function") {
        (window as any).cancelIdleCallback(timerId);
      } else {
        clearTimeout(timerId);
      }
      if (cleanup) cleanup();
    };
  }, []);

  return <>{children}</>;
}
