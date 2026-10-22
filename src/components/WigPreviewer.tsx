"use client";

import { useState } from "react";
import ErrorBoundary from "./ErrorBoundary";
import dynamic from "next/dynamic";

const Wig360Viewer = dynamic(() => import("./Wig360Viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
});

interface WigStyle {
  name: string;
  type: string;
  description: string;
  color: string;
  coverage: "full" | "patch" | "frontal";
  viewerConfig?: {
    id: string;
    basePath: string;
    frameCount: number;
  };
}

const wigStyles: WigStyle[] = [
  {
    name: "Classic Full Coverage",
    type: "Hair Wig",
    description: "Complete coverage with natural-looking density. Breathable micro-mesh base for all-day comfort.",
    color: "#1a1008",
    coverage: "full",
    viewerConfig: {
      id: "wig-1",
      basePath: "/wigs/wig-1/",
      frameCount: 36,
    }
  },
  {
    name: "Crown Patch System",
    type: "Hair Patch",
    description: "Targeted restoration for crown thinning. Custom-molded to blend seamlessly with existing hair.",
    color: "#2c1a0e",
    coverage: "patch",
    viewerConfig: {
      id: "wig-2",
      basePath: "/wigs/wig-2/",
      frameCount: 36,
    }
  },
  {
    name: "Frontal Hairline",
    type: "Hair Patch",
    description: "Natural hairline recreation. Ultra-thin lace front for an undetectable finish.",
    color: "#1f1510",
    coverage: "frontal",
    viewerConfig: {
      id: "wig-3",
      basePath: "/wigs/wig-3/",
      frameCount: 36,
    }
  },
];

export default function WigPreviewer() {
  const [activeWig, setActiveWig] = useState(0);
  const current = wigStyles[activeWig];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
      {/* Viewer Box */}
      <div
        className="h-[450px] md:h-[550px] w-full rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container-lowest relative shadow-xl"
      >
        <ErrorBoundary>
          {current.viewerConfig ? (
            <Wig360Viewer
              key={current.viewerConfig.id} // Re-mount when wig changes
              basePath={current.viewerConfig.basePath}
              frameCount={current.viewerConfig.frameCount}
              autoRotate={false}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-[#F3EEFB] text-primary">
              <span className="material-symbols-outlined text-5xl mb-4 opacity-50">3d_rotation</span>
              <p className="font-label-lg text-label-lg uppercase tracking-widest opacity-70">Preview coming soon</p>
            </div>
          )}
        </ErrorBoundary>
      </div>

      {/* Info Panel */}
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="font-headline-lg text-headline-lg text-on-dark mb-2">{current.name}</h3>
          <span className="inline-block px-3 py-1 border border-accent-glow text-accent-glow font-label-md text-label-md uppercase tracking-widest mb-4">
            {current.type}
          </span>
          <p className="font-body-lg text-body-lg text-on-dark-variant">{current.description}</p>
        </div>

        {/* Wig selector buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {wigStyles.map((wig, i) => (
            <button
              key={wig.name}
              onClick={() => setActiveWig(i)}
              className={`p-4 rounded border text-left transition-all duration-300 ${i === activeWig
                  ? "border-accent-glow bg-primary/20 shadow-lg shadow-primary/10"
                  : "border-white/10 bg-white/5 hover:border-accent-glow/50"
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-6 h-6 rounded-full border-2"
                  style={{
                    backgroundColor: wig.color,
                    borderColor: i === activeWig ? "#A78BFA" : "#6B6580",
                  }}
                />
                <span className="font-label-lg text-label-lg text-on-dark">{wig.name}</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-dark-variant">{wig.type}</span>
            </button>
          ))}
        </div>

        <button onClick={() => {
          const contact = document.getElementById("contact");
          if (contact) contact.scrollIntoView({ behavior: "smooth" });
        }} className="bg-primary text-on-primary px-8 py-4 font-label-lg text-label-lg uppercase tracking-widest hover:bg-primary/90 transition-all rounded-lg font-bold w-full md:w-auto shadow-soft hover:shadow-card">
          Book a Fitting Consultation
        </button>
      </div>
    </div>
  );
}
