import type { Config } from "tailwindcss";

// Design tokens for the agency's brand — see README "Design system" section
// before changing these. Palette is deliberately not the generic
// cream+terracotta / near-black+neon defaults; it's drawn from Greek coastal
// materials: limestone, deep Aegean water, sun-baked clay roof tile, olive.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C1A17", // primary text, near-black but warm
        limestone: "#F2EEE4", // primary background
        limestone2: "#E8E1D2", // secondary surface / cards
        aegean: "#123B3C", // deep teal-blue, primary accent
        aegean2: "#1F5B5C",
        clay: "#B5502B", // burnt sienna, secondary accent — CTAs, highlights
        olive: "#6B6B45", // muted tertiary, used sparingly (tags, dividers)
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      maxWidth: {
        content: "1400px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
