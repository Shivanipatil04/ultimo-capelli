"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

interface Wig360ViewerProps {
  basePath: string;
  frameCount?: number;
  autoRotate?: boolean;
  frameOrder?: number[];
  interactive?: boolean;
  rotationSeconds?: number;
  transparent?: boolean;
}

const ROTATE_DIRECTION = -1; // -1 or 1

// Simple module-level cache to avoid double-downloading if multiple viewers share the same basePath
const globalImageCache = new Map<string, (ImageBitmap | HTMLImageElement)[]>();
const globalPosterCache = new Map<string, ImageBitmap | HTMLImageElement>();

export default function Wig360Viewer({ 
  basePath, 
  frameCount = 36, 
  autoRotate = true,
  frameOrder,
  interactive = true,
  rotationSeconds = 12,
  transparent = false
}: Wig360ViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [loadedCount, setLoadedCount] = useState(0);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoRotate);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [interacting, setInteracting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const stateRef = useRef({
    images: [] as (ImageBitmap | HTMLImageElement)[],
    posterImage: null as ImageBitmap | HTMLImageElement | null,
    currentFrameIndex: 0,
    exactFrameIndex: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    velocity: 0,
    zoom: 1,
    panX: 0,
    panY: 0,
    lastPanX: 0,
    lastPanY: 0,
    isPlaying: autoRotate,
    lastInteractionTime: 0,
    debugMode: false,
    prefersReducedMotion: false,
    isVisible: true,
    pinchDistance: 0,
  });
  
  const rafRef = useRef<number | null>(null);

  const actualFrameOrder = useMemo(() => {
    if (frameOrder && frameOrder.length === frameCount) return frameOrder;
    return Array.from({ length: frameCount }, (_, i) => i + 1);
  }, [frameCount, frameOrder]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      stateRef.current.debugMode = urlParams.get('debug') === '1';
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      stateRef.current.prefersReducedMotion = reduced;
      setPrefersReducedMotion(reduced);
      if (reduced) {
        stateRef.current.isPlaying = false;
        setIsPlaying(false);
      }
    }
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // alpha: true is required for transparent mode so the purple hero bg shows through.
    // alpha: false is fine for the interactive preview (white-bg frames on lavender box).
    const ctx = canvas.getContext('2d', { alpha: transparent });
    if (!ctx) return;
    
    const state = stateRef.current;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    
    if (canvas.width !== Math.floor(displayWidth * dpr) || canvas.height !== Math.floor(displayHeight * dpr)) {
       canvas.width = Math.floor(displayWidth * dpr);
       canvas.height = Math.floor(displayHeight * dpr);
    }
    
    if (!transparent) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    const img = state.images[state.currentFrameIndex] || state.posterImage;
    if (!img) return;

    ctx.save();
    
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * state.zoom;
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    
    const maxPanX = Math.max(0, (drawWidth - canvas.width) / 2);
    const maxPanY = Math.max(0, (drawHeight - canvas.height) / 2);
    
    state.panX = Math.max(-maxPanX, Math.min(maxPanX, state.panX));
    state.panY = Math.max(-maxPanY, Math.min(maxPanY, state.panY));

    const drawX = (canvas.width - drawWidth) / 2 + state.panX;
    const drawY = (canvas.height - drawHeight) / 2 + state.panY;

    ctx.drawImage(img as CanvasImageSource, drawX, drawY, drawWidth, drawHeight);
    
    if (state.debugMode) {
      ctx.fillStyle = 'red';
      ctx.font = `${20 * dpr}px sans-serif`;
      ctx.fillText(`Frame: ${actualFrameOrder[state.currentFrameIndex]} (Index: ${state.currentFrameIndex})`, 10 * dpr, 30 * dpr);
    }
    
    ctx.restore();
  }, [actualFrameOrder]);

  const updateFrameIndex = useCallback((delta: number) => {
    const state = stateRef.current;
    let newExact = state.exactFrameIndex + delta * ROTATE_DIRECTION;
    while (newExact < 0) newExact += frameCount;
    state.exactFrameIndex = newExact % frameCount;
    state.currentFrameIndex = Math.floor(state.exactFrameIndex);
    drawFrame();
  }, [frameCount, drawFrame]);

  // Handle basePath change (reset view and load images)
  useEffect(() => {
    let active = true;
    const state = stateRef.current;
    
    // Check cache
    if (globalImageCache.has(basePath)) {
      state.images = globalImageCache.get(basePath) || [];
      state.posterImage = globalPosterCache.get(basePath) || null;
      setLoadedCount(frameCount);
      setIsFullyLoaded(true);
      drawFrame();
      return;
    }
    
    state.images = new Array(frameCount).fill(null);
    state.posterImage = null;
    state.currentFrameIndex = 0;
    state.exactFrameIndex = 0;
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    setZoomLevel(1);
    setLoadedCount(0);
    setIsFullyLoaded(false);

    const loadImage = async (index: number) => {
      const frameNum = actualFrameOrder[index];
      const url = `${basePath}${String(frameNum).padStart(3, '0')}.webp`;
      
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        let img;
        if (typeof createImageBitmap !== 'undefined') {
          img = await createImageBitmap(blob);
        } else {
          img = new Image();
          img.src = URL.createObjectURL(blob);
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        }
        if (active) {
          state.images[index] = img;
          if (index === 0) {
            state.posterImage = img;
            drawFrame();
          }
          setLoadedCount(prev => prev + 1);
        }
      } catch (err) {
        console.error("Failed to load image", url, err);
      }
    };

    loadImage(0).then(() => {
      for (let i = 1; i < frameCount; i++) {
         if (active) loadImage(i);
      }
    });

    return () => { active = false; };
  }, [basePath, frameCount, actualFrameOrder, drawFrame]);

  useEffect(() => {
    if (loadedCount === frameCount && loadedCount > 0 && !globalImageCache.has(basePath)) {
      globalImageCache.set(basePath, [...stateRef.current.images]);
      if (stateRef.current.posterImage) {
        globalPosterCache.set(basePath, stateRef.current.posterImage);
      }
      setIsFullyLoaded(true);
    } else if (loadedCount === frameCount) {
      setIsFullyLoaded(true);
    }
  }, [loadedCount, frameCount, basePath]);

  // Update internal isPlaying ref when state changes
  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
  }, [isPlaying]);

  // Visibility and animation loop
  useEffect(() => {
    const state = stateRef.current;
    
    const observer = new IntersectionObserver((entries) => {
      state.isVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const onVisibilityChange = () => {
      state.isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    let lastTime = performance.now();
    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;
      
      if (isFullyLoaded && state.isVisible && !document.hidden) {
        if (!state.isDragging && Math.abs(state.velocity) > 0.01) {
          if (!state.prefersReducedMotion) {
            updateFrameIndex(state.velocity);
            state.velocity *= 0.95; 
          } else {
            state.velocity = 0;
          }
        }
        
        if (!state.isDragging && state.isPlaying && Math.abs(state.velocity) <= 0.01) {
           const timeSinceInteraction = Date.now() - state.lastInteractionTime;
           if (!interactive || timeSinceInteraction > 4000) {
              const framesPerMs = frameCount / (rotationSeconds * 1000);
              updateFrameIndex(framesPerMs * dt * ROTATE_DIRECTION);
           }
        }
      }
      
      rafRef.current = requestAnimationFrame(loop);
    };
    
    rafRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isFullyLoaded, updateFrameIndex]);

  // Set zoom internally and externally
  const handleZoom = useCallback((newZoom: number) => {
    const state = stateRef.current;
    const z = Math.max(1, Math.min(3, newZoom));
    state.zoom = z;
    if (z === 1) {
      state.panX = 0;
      state.panY = 0;
    }
    setZoomLevel(z);
    drawFrame();
  }, [drawFrame]);

  // Pointer events
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isFullyLoaded) return;
    const state = stateRef.current;
    state.isDragging = true;
    state.lastInteractionTime = Date.now();
    setInteracting(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    
    if (e.pointerType === 'touch' && e.nativeEvent instanceof PointerEvent) {
      // Pinch to zoom logic is complex with PointerEvent in React if we don't track active pointers.
      // We'll rely on wheel for desktop and simple touch for rotation/pan. 
      // For real pinch, it's easier to use a touch event listener. 
    }
    
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.lastX = e.clientX;
    state.velocity = 0;
    state.lastPanX = state.panX;
    state.lastPanY = state.panY;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (!state.isDragging) return;
    state.lastInteractionTime = Date.now();
    
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = containerRef.current?.offsetWidth || 500;

    if (state.zoom === 1) {
      const dx = e.clientX - state.lastX;
      // scale sensitivity by container width so it feels consistent
      const sensitivity = 360 / containerWidth; 
      const deltaFrames = (dx * sensitivity) / 10;
      
      updateFrameIndex(deltaFrames);
      state.velocity = deltaFrames;
    } else {
      // panning
      const dx = (e.clientX - state.startX) * dpr;
      const dy = (e.clientY - state.startY) * dpr;
      state.panX = state.lastPanX + dx;
      state.panY = state.lastPanY + dy;
      drawFrame();
    }
    
    state.lastX = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    state.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (state.zoom > 1) {
      state.lastPanX = state.panX;
      state.lastPanY = state.panY;
    }
  };

  // Add passive=false wheel listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const state = stateRef.current;
      state.lastInteractionTime = Date.now();
      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
      handleZoom(state.zoom + zoomDelta);
    };
    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleNativeWheel);
  }, [handleZoom]);
  
  // Touch Pinch logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let initialPinchDistance = 0;
    let initialZoom = 1;
    
    const getDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialPinchDistance = getDistance(e.touches);
        initialZoom = stateRef.current.zoom;
        stateRef.current.isDragging = false; // stop rotation/pan
      }
    };
    
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getDistance(e.touches);
        const scale = dist / initialPinchDistance;
        handleZoom(initialZoom * scale);
      }
    };
    
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, [handleZoom]);

  const onDoubleClick = () => {
    const state = stateRef.current;
    state.lastInteractionTime = Date.now();
    handleZoom(state.zoom === 1 ? 2 : 1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!isFullyLoaded) return;
    const state = stateRef.current;
    state.lastInteractionTime = Date.now();
    
    switch (e.key) {
      case 'ArrowLeft':
        updateFrameIndex(-1);
        break;
      case 'ArrowRight':
        updateFrameIndex(1);
        break;
      case '+':
      case '=':
        handleZoom(state.zoom + 0.5);
        break;
      case '-':
      case '_':
        handleZoom(state.zoom - 0.5);
        break;
      case 'Home':
        handleZoom(1);
        state.currentFrameIndex = 0;
        drawFrame();
        break;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full ${interactive ? 'rounded-lg overflow-hidden border border-outline-variant/30 shadow-xl' : ''} transition-opacity duration-700 ${!interactive && !isFullyLoaded ? 'opacity-0' : 'opacity-100'}`}
      style={interactive ? { backgroundColor: '#F3EEFB' } : undefined} 
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full outline-none ${!interactive ? 'pointer-events-none' : ''}`}
        style={{ 
          mixBlendMode: transparent ? 'normal' : 'multiply',
          touchAction: !interactive ? 'auto' : (zoomLevel > 1 ? 'none' : 'pan-y'),
        }}
        data-lenis-prevent={interactive && (interacting || zoomLevel > 1) ? "true" : "false"}
        onPointerDown={interactive ? onPointerDown : undefined}
        onPointerMove={interactive ? onPointerMove : undefined}
        onPointerUp={interactive ? onPointerUp : undefined}
        onPointerCancel={interactive ? onPointerUp : undefined}
        onPointerLeave={interactive ? onPointerUp : undefined}
        onDoubleClick={interactive ? onDoubleClick : undefined}
        onKeyDown={interactive ? onKeyDown : undefined}
        tabIndex={interactive ? 0 : -1}
        aria-hidden={!interactive ? "true" : undefined}
        aria-label={interactive ? "360 degree view of wig" : undefined}
      />
      
      {/* Loading Bar */}
      {interactive && !isFullyLoaded && (
        <div className="absolute top-0 left-0 w-full h-1 bg-black/5">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(loadedCount / frameCount) * 100}%` }}
          />
        </div>
      )}

      {/* Controls Overlay */}
      {interactive && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          
          {/* Hint Pill */}
          <div className="bg-surface/80 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant/30 pointer-events-auto">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
              Drag to rotate · Scroll to zoom
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {!prefersReducedMotion && (
              <button 
                className="w-8 h-8 rounded-full bg-white/50 backdrop-blur border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-white/80 transition-colors"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? "Pause auto-rotate" : "Play auto-rotate"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
            )}
            
            <div className="flex items-center rounded-full bg-white/50 backdrop-blur border border-outline-variant/30 overflow-hidden">
              <button 
                className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-white/80 transition-colors"
                onClick={() => handleZoom(zoomLevel - 0.5)}
                aria-label="Zoom out"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <button 
                className="px-2 h-8 flex items-center justify-center text-on-surface hover:bg-white/80 transition-colors font-label-sm text-label-sm border-x border-outline-variant/20"
                onClick={() => handleZoom(1)}
                aria-label="Reset zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button 
                className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-white/80 transition-colors"
                onClick={() => handleZoom(zoomLevel + 0.5)}
                aria-label="Zoom in"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
