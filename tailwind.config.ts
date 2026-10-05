import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Design System Foundation: Application Palette
        app: {
          bg: "var(--app-bg)",
          surface: "var(--app-surface)",
          "surface-subdued": "var(--app-surface-subdued)",
          "surface-hover": "var(--app-surface-hover)",
          border: "var(--app-border)",
          "border-subtle": "var(--app-border-subtle)",
          "border-strong": "var(--app-border-strong)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverted: "var(--text-inverted)",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
          DEFAULT: "var(--brand-primary)",
          hover: "var(--brand-hover)",
          subtle: "var(--brand-subtle)",
          ring: "var(--brand-ring)",
        },
        status: {
          success: "var(--status-success)",
          "success-subtle": "var(--status-success-subtle)",
          warning: "var(--status-warning)",
          "warning-subtle": "var(--status-warning-subtle)",
          error: "var(--status-error)",
          "error-subtle": "var(--status-error-subtle)",
          info: "var(--status-info)",
          "info-subtle": "var(--status-info-subtle)",
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
        raised: "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        overlay: "0 12px 24px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -4px rgba(0, 0, 0, 0.06)",
        modal: "0 24px 48px -12px rgba(0, 0, 0, 0.18)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        smooth: "300ms",
      },
    },
  },
  plugins: [],
};
export default config;
