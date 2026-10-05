"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const LOCAL_VIDEO_MAP: Record<string, string> = {
  "https://www.instagram.com/reel/Da7NV3Ok_04/": "/assets/gallery-videos/video-1.mp4",
  "https://www.instagram.com/reel/DdYOWVzCQij/": "/assets/gallery-videos/video-2.mp4",
  "https://www.instagram.com/reel/Dac4HbPDjnY/": "/assets/gallery-videos/video-3.mp4",
  "https://www.instagram.com/reel/DapgFbfAorL/": "/assets/gallery-videos/video-4.mp4",
  "https://www.instagram.com/reel/DcN9rAdEjcd/": "/assets/gallery-videos/video-5.mp4",
};

const getLocalSrc = (url: string) => {
  if (!url) return undefined;
  const cleanUrl = url.split('?')[0].replace(/\/$/, '') + '/';
  return LOCAL_VIDEO_MAP[cleanUrl];
};

export default function VideoGallery() {
  const [videos, setVideos] = useState<any[]>([]);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [activeId, setActiveId] = useState<string>("v1");
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const cardRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use a ref for active ID inside the observer to avoid dependency issues
  const activeIdRef = useRef("v1");

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (data && data.length > 0) {
          const active = data.filter((v: any) => v.isActive).map((v: any, i: number) => ({
            id: `v${i + 1}`,
            src: getLocalSrc(v.instagramUrl),
            url: v.instagramUrl,
            embedUrl: v.instagramUrl ? v.instagramUrl.split('?')[0].replace(/\/$/, '') + '/embed' : ''
          }));
          setVideos(active);
        } else {
          // Fallback dummy data if no DB connected
          setVideos(Object.entries(LOCAL_VIDEO_MAP).map(([url, src], i) => ({
            id: `v${i + 1}`,
            src,
            url,
            embedUrl: url.replace(/\/$/, '') + '/embed'
          })));
        }
      });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Force first frame render for thumbnails
  useEffect(() => {
    videos.forEach((v) => {
      const vid = videoRefs.current[v.id];
      if (vid) {
        // Small delay ensures the video element is ready
        setTimeout(() => {
          if (vid.readyState >= 1) {
            vid.currentTime = 0.001;
          } else {
            vid.addEventListener("loadedmetadata", () => {
              vid.currentTime = 0.001;
            }, { once: true });
          }
        }, 50);
      }
    });
  }, [videos]);

  // Hover interactions for mouse devices
  const handleMouseEnter = useCallback((id: string) => {
    if (isReducedMotion) return;
    const vid = videoRefs.current[id];
    if (vid) {
      vid.play().catch(() => { });
    }
  }, [isReducedMotion]);

  const handleMouseLeave = useCallback((id: string) => {
    if (isReducedMotion) return;
    const vid = videoRefs.current[id];
    if (vid) {
      vid.pause();
      vid.currentTime = 0.001;
    }
  }, [isReducedMotion]);

  // Intersection observer for auto-playing active video (especially for mobile/touch)
  useEffect(() => {
    if (isReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const id = entry.target.getAttribute("data-id");
            if (id && id !== activeIdRef.current) {
              activeIdRef.current = id;
              setActiveId(id);
            }
          }
        });
      },
      {
        root: null, // Use viewport as root to avoid issues with Lenis
        threshold: [0.6, 0.9],
        rootMargin: "-10% 0px -10% 0px", // Slight margin to trigger when reasonably centered
      }
    );

    Object.values(cardRefs.current).forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => observer.disconnect();
  }, [videos, isReducedMotion]);

  // Play active video on mobile/touch, pause others
  useEffect(() => {
    if (isReducedMotion) return;

    // Only auto-play based on intersection if we are on a smaller screen or touch device
    // On desktop, hover handles playback, so we don't force auto-play based on scroll position
    const isTouch = window.matchMedia("(hover: none)").matches || window.innerWidth < 768;

    if (isTouch) {
      videos.forEach((v) => {
        const vid = videoRefs.current[v.id];
        if (vid) {
          if (v.id === activeId) {
            vid.play().catch(() => { });
          } else {
            vid.pause();
          }
        }
      });
    }
  }, [activeId, isReducedMotion, videos]);

  const scrollToCard = useCallback((id: string) => {
    const card = cardRefs.current[id];
    if (card && scrollRef.current) {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, []);

  return (
    <div className="w-full">
      <div className="w-full relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full pb-8 pt-4 px-4 md:px-8 gap-4 md:gap-6 items-center"
        >
          {/* Spacers to center the first and last items */}
          <div className="shrink-0 snap-align-none w-[4vw] md:w-[25vw] lg:w-[35vw]" aria-hidden="true" />

          {videos.map((video) => {
            const isActive = video.id === activeId;
            return (
              <a
                key={video.id}
                ref={(el) => { cardRefs.current[video.id] = el; }}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                data-id={video.id}
                onMouseEnter={() => handleMouseEnter(video.id)}
                onMouseLeave={() => handleMouseLeave(video.id)}
                onFocus={() => handleMouseEnter(video.id)}
                onBlur={() => handleMouseLeave(video.id)}
                className={`video-gallery-item group relative shrink-0 snap-center rounded-2xl overflow-hidden block outline-none focus-visible:ring-4 focus-visible:ring-primary shadow-soft hover:shadow-card bg-surface-container/50 ${isReducedMotion
                    ? "w-[80vw] md:w-[38vw] lg:w-[24vw]"
                    : "w-[80vw] md:w-[38vw] lg:w-[24vw] transition-all duration-500 ease-out"
                  }`}
                style={{
                  transform: isReducedMotion ? "none" : isActive ? "scale(1)" : "scale(0.92)",
                  opacity: isReducedMotion ? 1 : isActive ? 1 : 0.6,
                }}
                aria-label="Watch full video on Instagram"
              >
                <div className="aspect-[9/16] w-full relative">
                  {video.src ? (
                    <div className="w-full h-full relative cursor-pointer">
                      <video
                        ref={(el) => { videoRefs.current[video.id] = el; }}
                        src={video.src}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        loop
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="material-symbols-outlined text-white text-5xl md:text-6xl">play_circle</span>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={video.embedUrl}
                      className="w-full h-full border-none pointer-events-none bg-white"
                      scrolling="no"
                      allowTransparency={true}
                    />
                  )}

                  {/* Overlay for Desktop Hover */}
                  <div
                    className={`absolute inset-0 bg-black/40 flex flex-col justify-end p-6 opacity-0 pointer-events-none ${isReducedMotion ? "focus-within:opacity-100" : "transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100"
                      }`}
                  >
                    <div className="flex items-center text-white font-label-sm md:text-sm uppercase tracking-wider font-semibold">
                      Watch full video <span className="material-symbols-outlined ml-1.5 text-[18px]">open_in_new</span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}

          <div className="shrink-0 snap-align-none w-[4vw] md:w-[25vw] lg:w-[35vw]" aria-hidden="true" />
        </div>

        {/* Progress Indicator */}
        {videos.length > 0 && (
          <div className="flex flex-col items-center gap-2 mt-2 px-4">
            <div className="flex items-center gap-3">
              <span className="font-label-md text-xs font-semibold text-primary tracking-widest">
                0{videos.findIndex((v) => v.id === activeId) + 1}
              </span>
              <span className="text-on-surface-variant/40 font-body-sm text-xs">/</span>
              <span className="font-label-md text-xs text-on-surface-variant/60 tracking-widest">
                0{videos.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => scrollToCard(video.id)}
                  className={`h-1.5 rounded-full transition-all duration-300 border-none p-0 cursor-pointer ${video.id === activeId
                      ? "w-4 bg-primary"
                      : "w-1.5 bg-outline-variant/60 hover:bg-primary/50"
                    }`}
                  aria-label="Go to video"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instagram CTA */}
      <div className="flex justify-center mt-8 md:mt-12 mb-4">
        <a
          href="https://www.instagram.com/ultimocapellipuneandnashik?stkn=ZDNlZDc0MzIxNw=="
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
        >
          See more on Instagram <span className="material-symbols-outlined ml-1.5 text-sm">arrow_outward</span>
        </a>
      </div>
    </div>
  );
}
