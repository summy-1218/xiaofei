import type { Config } from "tailwindcss";
import { DESIGN_TOKENS } from "./src/lib/design-tokens";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // 品牌色
        brand: {
          navy: DESIGN_TOKENS.colors["brand-navy"],
          "navy-deep": DESIGN_TOKENS.colors["brand-navy-deep"],
          "navy-mid": DESIGN_TOKENS.colors["brand-navy-mid"],
        },
        // 主色
        primary: {
          DEFAULT: DESIGN_TOKENS.colors.primary,
          pressed: DESIGN_TOKENS.colors["primary-pressed"],
          deep: DESIGN_TOKENS.colors["primary-deep"],
        },
        // 功能色
        surface: {
          DEFAULT: DESIGN_TOKENS.colors.surface,
          soft: DESIGN_TOKENS.colors["surface-soft"],
        },
        canvas: DESIGN_TOKENS.colors.canvas,
        // 文字色
        ink: {
          deep: DESIGN_TOKENS.colors["ink-deep"],
          DEFAULT: DESIGN_TOKENS.colors.ink,
        },
        charcoal: DESIGN_TOKENS.colors.charcoal,
        slate: DESIGN_TOKENS.colors.slate,
        steel: DESIGN_TOKENS.colors.steel,
        stone: DESIGN_TOKENS.colors.stone,
        muted: DESIGN_TOKENS.colors.muted,
        // 语义色
        success: DESIGN_TOKENS.colors["semantic-success"],
        warning: DESIGN_TOKENS.colors["semantic-warning"],
        error: DESIGN_TOKENS.colors["semantic-error"],
        // 卡片色
        card: {
          peach: DESIGN_TOKENS.colors["card-tint-peach"],
          rose: DESIGN_TOKENS.colors["card-tint-rose"],
          mint: DESIGN_TOKENS.colors["card-tint-mint"],
          lavender: DESIGN_TOKENS.colors["card-tint-lavender"],
          sky: DESIGN_TOKENS.colors["card-tint-sky"],
          yellow: DESIGN_TOKENS.colors["card-tint-yellow"],
          "yellow-bold": DESIGN_TOKENS.colors["card-tint-yellow-bold"],
          cream: DESIGN_TOKENS.colors["card-tint-cream"],
        },
      },
      fontFamily: {
        sans: [
          "Notion Sans",
          "Inter",
          "-apple-system",
          "system-ui",
          "Segoe UI",
          "Helvetica",
          "sans-serif",
        ],
      },
      fontSize: {
        "hero-display": ["80px", { lineHeight: "1.05", letterSpacing: "-2px", fontWeight: "600" }],
        "display-lg": ["56px", { lineHeight: "1.10", letterSpacing: "-1px", fontWeight: "600" }],
        "heading-1": ["48px", { lineHeight: "1.15", letterSpacing: "-0.5px", fontWeight: "600" }],
        "heading-2": ["36px", { lineHeight: "1.20", letterSpacing: "-0.5px", fontWeight: "600" }],
        "heading-3": ["28px", { lineHeight: "1.25", fontWeight: "600" }],
        "heading-4": ["22px", { lineHeight: "1.30", fontWeight: "600" }],
        "heading-5": ["18px", { lineHeight: "1.40", fontWeight: "600" }],
        subtitle: ["18px", { lineHeight: "1.50", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.55", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.50", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "1.40", fontWeight: "400" }],
        micro: ["12px", { lineHeight: "1.40", fontWeight: "500" }],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        xxl: "20px",
        xxxl: "24px",
        full: "9999px",
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        xxl: "32px",
        xxxl: "40px",
        section: "64px",
        "section-lg": "96px",
        hero: "120px",
      },
      boxShadow: {
        card: "rgba(15, 15, 15, 0.08) 0px 4px 12px 0px",
        mockup: "rgba(15, 15, 15, 0.20) 0px 24px 48px -8px",
        modal: "rgba(15, 15, 15, 0.16) 0px 16px 48px -8px",
        subtle: "rgba(15, 15, 15, 0.04) 0px 1px 2px 0px",
      },
    },
  },
  plugins: [],
};
export default config;
