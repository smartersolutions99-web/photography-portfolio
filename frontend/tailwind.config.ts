import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Topla „film / papir" paleta. Zadržavamo postojeća imena (cream/ink/muted/
        // line/accent) da ne prepisujemo cijeli kod, ali s novim toplim vrijednostima,
        // + nova imena za tamne editorial sekcije (olive/brown).
        cream: "#F2EFE7", // dominantna ivory pozadina
        surface: "#F7F4ED", // svjetlija površina (naizmjenične sekcije)
        paper: "#EAE4D8", // topliji papir (akcenti pozadine)
        ink: "#24231F", // primarni tekst (topla skoro-crna)
        muted: "#767166", // sekundarni tekst
        line: "#DAD3C6", // topla hairline linija
        accent: "#7E6A54", // topli smeđe-taupe akcent
        olive: "#66634B",
        deepolive: "#454333", // tamna olive sekcija
        taupe: "#857462",
        brown: "#665548",
        dark: "#26251F", // topla tamna (footer / final CTA)
      },
      fontFamily: {
        serif: ["var(--font-serif)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        kenburns: {
          "0%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1.15)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        kenburns: "kenburns 18s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
