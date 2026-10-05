"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";

import before1 from "@/assets/before-1.jpeg";
import after1 from "@/assets/after-1.jpeg";
import before2 from "@/assets/before-2.jpeg";
import after2 from "@/assets/after-2.jpeg";
import before3 from "@/assets/before-3.jpeg";
import after3 from "@/assets/after-3.jpeg";
import before4 from "@/assets/before-4.jpeg";
import after4 from "@/assets/after-4.jpeg";

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
 * Horizontal carousel of before/after transformation pairs.
 * Shows 2 pairs at a time on desktop, 1 on mobile.
 * All images are forced to the same visual size via aspect-ratio + object-cover.
 */
export default function BeforeAfterHead() {
  const [transformations, setTransformations] = useState<TransformationPair[]>(defaultTransformations);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch from DB, fall back to defaults
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
          if (fetched.length > 0) setTransformations(fetched);
        }
      })
      .catch(console.error);
  }, []);

  // IntersectionObserver to track which card is most visible
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      {
        root: container,
        threshold: [0.5, 0.8],
      }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [transformations]);

  const scrollToCard = useCallback((idx: number) => {
    const card = cardRefs.current[idx];
    if (card && scrollRef.current) {
      card.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  }, []);

  return (
    <div className="py-12 md:py-20 bg-background overflow-hidden">
      {/* Heading */}
      <div className="text-center mb-6 md:mb-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto reveal-section">
        <h2 className="reveal-item font-display-lg text-2xl sm:text-3xl md:text-display-lg text-on-surface mb-2">
          The Transformation
        </h2>
        <p className="reveal-item font-body-md text-sm md:text-base text-on-surface-variant max-w-md mx-auto">
          See the difference a natural-looking transformation can make.
        </p>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 md:gap-6 px-margin-mobile md:px-margin-desktop pb-4"
        style={{ scrollPaddingInline: "20px" }}
      >
        {transformations.map((pair, idx) => (
          <div
            key={pair.id}
            ref={(el) => { cardRefs.current[idx] = el; }}
            data-index={idx}
            className="snap-start shrink-0 w-[85vw] sm:w-[80vw] md:w-[40vw] lg:w-[32vw]"
          >
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {/* Before */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] md:text-xs font-semibold text-on-surface-variant/60 uppercase tracking-[0.15em] mb-2">
                  Before
                </span>
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container relative">
                  <Image
                    src={pair.beforeImg}
                    alt="Before treatment"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 42vw, 25vw"
                    priority={idx < 2}
                  />
                </div>
              </div>

              {/* After */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] md:text-xs font-semibold text-primary/70 uppercase tracking-[0.15em] mb-2">
                  After
                </span>
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container relative">
                  <Image
                    src={pair.afterImg}
                    alt="After restoration"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 42vw, 25vw"
                    priority={idx < 2}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* End spacer so last card can snap properly */}
        <div className="shrink-0 w-[1px]" aria-hidden="true" />
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mt-4 md:mt-6">
        <span className="text-xs font-semibold text-primary tracking-widest">
          0{activeIndex + 1}
        </span>
        <span className="text-on-surface-variant/30 text-xs">/</span>
        <span className="text-xs text-on-surface-variant/50 tracking-widest">
          0{transformations.length}
        </span>
        <div className="flex items-center gap-1.5 ml-1">
          {transformations.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToCard(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 border-none bg-transparent p-0 cursor-pointer ${idx === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-outline-variant/50"
                }`}
              aria-label={`Go to transformation ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
