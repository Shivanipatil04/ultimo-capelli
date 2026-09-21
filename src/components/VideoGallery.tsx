"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const videos = [
  {
    id: "v1",
    src: "/assets/gallery-videos/video-1.mp4",
    url: "https://www.instagram.com/reel/Da7NV3Ok_04",
  },
  {
    id: "v2",
    src: "/assets/gallery-videos/video-2.mp4",
    url: "https://www.instagram.com/reel/DdYOWVzCQij",
  },
  {
    id: "v3",
    src: "/assets/gallery-videos/video-3.mp4",
    url: "https://www.instagram.com/reel/Dac4HbPDjnY",
  },
  {
    id: "v4",
    src: "/assets/gallery-videos/video-4.mp4",
    url: "https://www.instagram.com/reel/DapgFbfAorL",
  },
  {
    id: "v5",
    src: "/assets/gallery-videos/video-5.mp4",
    url: "https://www.instagram.com/reel/DcN9rAdEjcd",
  },
];

export default function VideoGallery() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [activeMobileId, setActiveMobileId] = useState<string>("v1");
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const mobileContainerRef = useRef<HTMLDivElement>(null);

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
      ['desktop', 'mobile'].forEach((prefix) => {
        const vid = videoRefs.current[`${prefix}-${v.id}`];
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
    });
  }, []);

  // Desktop hover interactions
  const handleMouseEnter = useCallback((id: string) => {
    // Only attempt hover interactions on desktop
    if (window.innerWidth < 768 || isReducedMotion) return;
    const vid = videoRefs.current[`desktop-${id}`];
    if (vid) {
      vid.play().catch(() => {});
    }
  }, [isReducedMotion]);

  const handleMouseLeave = useCallback((id: string) => {
    if (window.innerWidth < 768 || isReducedMotion) return;
    const vid = videoRefs.current[`desktop-${id}`];
    if (vid) {
      vid.pause();
      vid.currentTime = 0.001;
    }
  }, [isReducedMotion]);

  // Mobile intersection observer for active centered video
  useEffect(() => {
    if (isReducedMotion || window.innerWidth >= 768) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const id = entry.target.getAttribute("data-id");
            if (id && id !== activeMobileId) {
              setActiveMobileId(id);
            }
          }
        });
      },
      {
        root: mobileContainerRef.current,
        threshold: [0.6, 0.9],
        rootMargin: "0px -10% 0px -10%",
      }
    );

    const items = document.querySelectorAll(".mobile-video-item");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [activeMobileId, isReducedMotion]);

  // Play active mobile video, pause others
  useEffect(() => {
    if (window.innerWidth >= 768 || isReducedMotion) return;
    videos.forEach((v) => {
      const vid = videoRefs.current[`mobile-${v.id}`];
      if (vid) {
        if (v.id === activeMobileId) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      }
    });
  }, [activeMobileId, isReducedMotion]);

  // Handle resizing between layouts safely
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        videos.forEach(v => {
          const vid = videoRefs.current[`desktop-${v.id}`];
          if (vid) {
            vid.pause();
            vid.currentTime = 0.001;
          }
          const mobileVid = videoRefs.current[`mobile-${v.id}`];
          if (mobileVid) {
            mobileVid.pause();
          }
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full">
      {/* ── DESKTOP LAYOUT (Hidden on mobile) ── */}
      <div className="hidden md:block w-full max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8 justify-items-center">
          {videos.slice(0, 3).map((video) => (
            <DesktopVideoCard
              key={video.id}
              video={video}
              videoRefs={videoRefs}
              isReducedMotion={isReducedMotion}
              onEnter={() => handleMouseEnter(video.id)}
              onLeave={() => handleMouseLeave(video.id)}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto justify-items-center">
          {videos.slice(3, 5).map((video) => (
            <DesktopVideoCard
              key={video.id}
              video={video}
              videoRefs={videoRefs}
              isReducedMotion={isReducedMotion}
              onEnter={() => handleMouseEnter(video.id)}
              onLeave={() => handleMouseLeave(video.id)}
            />
          ))}
        </div>
      </div>

      {/* ── MOBILE LAYOUT (Hidden on desktop) ── */}
      <div className="block md:hidden w-full relative">
        <div
          ref={mobileContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full pb-8 pt-4 px-4 gap-4 items-center"
        >
          {/* Add a spacer so the first and last items can be centered perfectly */}
          <div className="w-[8vw] shrink-0 snap-align-none" aria-hidden="true" />
          
          {videos.map((video) => {
            const isActive = video.id === activeMobileId;
            return (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                data-id={video.id}
                className={`mobile-video-item relative shrink-0 snap-center rounded-2xl overflow-hidden block outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isReducedMotion ? "w-[75vw]" : "w-[75vw] transition-all duration-500 ease-out"
                }`}
                style={{
                  transform: isReducedMotion ? "none" : isActive ? "scale(1)" : "scale(0.88)",
                  opacity: isReducedMotion ? 1 : isActive ? 1 : 0.6,
                }}
                aria-label="Watch full video on Instagram"
              >
                <div className="aspect-[9/16] w-full bg-surface-container/50">
                  <video
                    ref={(el) => { videoRefs.current[`mobile-${video.id}`] = el; }}
                    src={video.src}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    loop
                    preload="metadata"
                  />
                </div>
              </a>
            );
          })}
          
          <div className="w-[8vw] shrink-0 snap-align-none" aria-hidden="true" />
        </div>

        {/* Mobile Progress Indicator */}
        <div className="flex flex-col items-center gap-2 mt-2 px-4">
          <div className="flex items-center gap-3">
            <span className="font-label-md text-xs font-semibold text-primary tracking-widest">
              0{videos.findIndex((v) => v.id === activeMobileId) + 1}
            </span>
            <span className="text-on-surface-variant/40 font-body-sm text-xs">/</span>
            <span className="font-label-md text-xs text-on-surface-variant/60 tracking-widest">
              05
            </span>
          </div>
          <div className="flex items-center gap-2">
            {videos.map((video) => (
              <span
                key={video.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  video.id === activeMobileId
                    ? "w-2 bg-primary"
                    : "w-1.5 bg-outline-variant/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* ── Desktop Instagram CTA ── */}
      <div className="hidden md:flex justify-center mt-12 mb-4">
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

function DesktopVideoCard({
  video,
  videoRefs,
  isReducedMotion,
  onEnter,
  onLeave,
}: {
  video: typeof videos[0];
  videoRefs: React.MutableRefObject<{ [key: string]: HTMLVideoElement | null }>;
  isReducedMotion: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      className={`group relative block w-full max-w-[340px] aspect-[9/16] rounded-2xl overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-primary shadow-soft hover:shadow-card bg-surface-container/50 ${
        isReducedMotion ? "" : "transition-transform duration-500 ease-out hover:scale-[1.03]"
      }`}
      aria-label="Watch full video on Instagram"
    >
      <video
        ref={(el) => { videoRefs.current[`desktop-${video.id}`] = el; }}
        src={video.src}
        className="w-full h-full object-cover"
        muted
        playsInline
        loop
        preload="metadata"
      />
      
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black/40 flex flex-col justify-end p-6 opacity-0 ${
          isReducedMotion ? "focus-within:opacity-100" : "transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100"
        }`}
      >
        <div className="flex items-center text-white font-label-sm text-sm uppercase tracking-wider font-semibold">
          Watch full video <span className="material-symbols-outlined ml-1.5 text-[18px]">open_in_new</span>
        </div>
      </div>
    </a>
  );
}
