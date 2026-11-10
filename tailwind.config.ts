const animate = require("tailwindcss-animate");

/** A colour token from app/globals.css, with opacity-modifier support. */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  safelist: ["dark"],
  prefix: "",

  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],

  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem" },
      screens: { "2xl": "1280px" },
    },

    /* Type scale (rem, so it follows the browser's font-size setting).
       Body text never drops below 16px: `text-sm` is deliberately 1rem too,
       so older markup can't shrink copy. `text-xs` (14px) is reserved for
       short badges and captions. Steps above base grow by about 1.25x. */
    fontSize: {
      xs: ["0.875rem", { lineHeight: "1.4" }],
      sm: ["1rem", { lineHeight: "1.5" }],
      base: ["1rem", { lineHeight: "1.5" }],
      lg: ["1.125rem", { lineHeight: "1.55" }],
      xl: ["1.25rem", { lineHeight: "1.4" }],
      "2xl": ["1.5rem", { lineHeight: "1.3" }],
      "3xl": ["1.875rem", { lineHeight: "1.25" }],
      "4xl": ["2.25rem", { lineHeight: "1.2" }],
      "5xl": ["clamp(2.25rem, 1.75rem + 2vw, 3rem)", { lineHeight: "1.15" }],
      "6xl": ["clamp(2.25rem, 1.5rem + 3vw, 3.5rem)", { lineHeight: "1.1" }],
    },

    borderRadius: {
      none: "0",
      sm: "var(--radius-sm)",
      DEFAULT: "var(--radius-sm)",
      md: "var(--radius-md)",
      lg: "var(--radius-lg)",
      xl: "var(--radius-lg)",
      full: "9999px",
    },

    boxShadow: {
      none: "none",
      sm: "0 1px 2px rgb(var(--shadow-color) / 0.06), 0 1px 3px rgb(var(--shadow-color) / 0.08)",
      DEFAULT:
        "0 1px 2px rgb(var(--shadow-color) / 0.06), 0 1px 3px rgb(var(--shadow-color) / 0.08)",
      md: "0 4px 12px -2px rgb(var(--shadow-color) / 0.12)",
      lg: "0 16px 40px -12px rgb(var(--shadow-color) / 0.25)",
      xl: "0 16px 40px -12px rgb(var(--shadow-color) / 0.25)",
    },

    extend: {
      fontFamily: {
        // One hyperlegible family everywhere; system fonts if it fails to load.
        sans: ["var(--font-body)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        heading: ["var(--font-body)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      spacing: {
        // Minimum touch target (WCAG 2.5.8 asks 24px; we use 44px).
        tap: "2.75rem",
        section: "var(--space-section)",
      },
      maxWidth: {
        measure: "var(--measure)",
      },
      colors: {
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        background: token("background"),
        foreground: token("foreground"),
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
          hover: token("primary-hover"),
        },
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
        },
        view: {
          DEFAULT: token("view"),
          foreground: token("view-foreground"),
          hover: token("view-hover"),
        },
        destructive: {
          DEFAULT: token("destructive"),
          foreground: token("destructive-foreground"),
          hover: token("destructive-hover"),
        },
        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        accent: {
          DEFAULT: token("accent"),
          foreground: token("accent-foreground"),
        },
        popover: {
          DEFAULT: token("popover"),
          foreground: token("popover-foreground"),
        },
        card: {
          DEFAULT: token("card"),
          foreground: token("card-foreground"),
        },
        brand: {
          DEFAULT: token("brand"),
          foreground: token("brand-foreground"),
          gold: token("brand-gold"),
        },
        bronze: token("bronze"),
        success: { DEFAULT: token("success"), bg: token("success-bg") },
        warning: { DEFAULT: token("warning"), bg: token("warning-bg") },
        danger: { DEFAULT: token("danger"), bg: token("danger-bg") },
        info: { DEFAULT: token("info"), bg: token("info-bg") },
        sidebar: {
          DEFAULT: token("sidebar-background"),
          foreground: token("sidebar-foreground"),
          primary: token("sidebar-primary"),
          "primary-foreground": token("sidebar-primary-foreground"),
          accent: token("sidebar-accent"),
          "accent-foreground": token("sidebar-accent-foreground"),
          border: token("sidebar-border"),
          ring: token("sidebar-ring"),
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-in-out",
        "collapsible-up": "collapsible-up 0.2s ease-in-out",
      },
    },
  },
  plugins: [animate],
};
