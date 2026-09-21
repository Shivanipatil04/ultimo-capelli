import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Light base ──
        "background": "#FAF9FC",          // very pale lavender-white (primary bg)
        "surface": "#F3EFFA",             // slightly deeper pale lavender (alternating sections)
        "surface-container": "#EEEAF6",   // stats bar / footer
        "surface-container-low": "#F7F5FB",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-high": "#E8E3F2",
        "surface-container-highest": "#E0DAF0",

        // ── Dark sections (hero + wig preview) ──
        "dark-surface": "#1A1030",
        "dark-surface-end": "#2A1750",

        // ── Accent ──
        "primary": "#7C3AED",
        "primary-container": "#DDD6FE",
        "primary-fixed": "#EDE9FE",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#4C1D95",

        // ── Text on light ──
        "on-background": "#1E1B2E",       // deep charcoal-plum (headings)
        "on-surface": "#1E1B2E",
        "on-surface-variant": "#6B6580",  // muted grey-purple (body)

        // ── Text on dark ──
        "on-dark": "#F5F0FF",
        "on-dark-variant": "#B8AED0",

        // ── Borders ──
        "outline": "#A89FC0",
        "outline-variant": "#E4DDF5",     // lavender card borders
        "accent-glow": "#A78BFA",
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "container-max": "1280px",
        "margin-mobile": "20px",
        "unit": "8px",
        "gutter": "24px",
        "stack-sm": "24px",
        "stack-lg": "80px",
        "stack-md": "48px",
        "margin-desktop": "64px"
      },
      fontFamily: {
        "body-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Playfair Display", "serif"],
        "headline-md": ["Playfair Display", "serif"],
        "headline-lg": ["Playfair Display", "serif"],
        "headline-sm": ["Playfair Display", "serif"],
        "label-lg": ["Inter", "sans-serif"],
        "display-lg": ["Playfair Display", "serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"]
      },
      fontSize: {
        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500" }],
        "headline-lg-mobile": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "headline-md": ["32px", { "lineHeight": "40px", "fontWeight": "500" }],
        "headline-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "headline-sm": ["24px", { "lineHeight": "32px", "fontWeight": "500" }],
        "label-lg": ["14px", { "lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "display-lg": ["64px", { "lineHeight": "72px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
      },
      boxShadow: {
        "soft": "0 2px 20px rgba(124, 58, 237, 0.06)",
        "card": "0 4px 30px rgba(124, 58, 237, 0.08)",
        "elevated": "0 8px 40px rgba(124, 58, 237, 0.12)",
      }
    },
  },
  plugins: [],
};
export default config;
